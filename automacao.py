import os, sys, argparse
from datetime import datetime, timedelta
from dotenv import load_dotenv
import mysql.connector, requests, schedule, time

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASS", ""),
    "database": os.getenv("DB_NAME", "estoque_db")
}

EVOLUTION_url = os.getenv("EVOLUTION_API_URL", "")#Colocar a url do localhost no ""
EVOLUTION_key = os.getenv("EVOLUTION_API_KEY", "")##Colocar a key do localhost no ""
EVOLUTION_INSTANCE = os.getenv("EVOLUTION_INSTANCE", "")#Colocar a instancia do localhost no ""
WHATSSAPP_API_URL = os.getenv("WHATSAPP_API_URL", "")#Colocar numero de telefone do whatsapp no ""


#Banco de dados
def conectar():

    return mysql.connector.connect(**DB_CONFIG)

def buscarDados(periodo: str) -> dict:
    """Busca os dados de vendas para o relatorio."""
    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    tempoAtual = datetime.now()
    if periodo == "hoje":
        data_inicio = tempoAtual.replace(hour=0, minute=0, second=0, microsecond=0)
    elif periodo =="7dias":
        data_inicio = tempoAtual - timedelta(days=7)
    elif periodo == "30dias":
        data_inicio = tempoAtual.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    else:
        data_inicio = None

    filtro_sql = "WHERE v.data_venda >= %s" if data_inicio else ""
    params = (data_inicio,) if data_inicio else ()


    # ── Métricas de vendas ──────────────────────────────────
    cursor.execute(f"""
        SELECT
            COUNT(*)                    AS total_vendas,
            COALESCE(SUM(total), 0)     AS faturamento,
            COALESCE(SUM(custo_total),0)AS custo_total,
            COALESCE(SUM(total - custo_total), 0) AS lucro
        FROM vendas v
        {filtro_sql}
    """, params)
    metricas = cursor.fetchone()
 
    ticket_medio = (
        metricas["faturamento"] / metricas["total_vendas"]
        if metricas["total_vendas"] > 0 else 0
    )
    margem = (
        round(metricas["lucro"] / metricas["faturamento"] * 100, 1)
        if metricas["faturamento"] > 0 else 0
    )


      # ── Top 5 produtos mais vendidos ────────────────────────
    cursor.execute(f"""
        SELECT
            iv.nome_produto,
            iv.marca,
            SUM(iv.quantidade)  AS qtd,
            SUM(iv.subtotal)    AS receita
        FROM itens_venda iv
        JOIN vendas v ON v.id = iv.venda_id
        {filtro_sql.replace('v.data_venda', 'v.data_venda')}
        GROUP BY iv.produto_id, iv.nome_produto, iv.marca
        ORDER BY qtd DESC
        LIMIT 5
    """, params)
    top_produtos = cursor.fetchall()
 
    # ── Formas de pagamento ─────────────────────────────────
    cursor.execute(f"""
        SELECT
            forma_pagamento,
            COUNT(*)            AS qtd,
            SUM(total)          AS total
        FROM vendas v
        {filtro_sql}
        GROUP BY forma_pagamento
        ORDER BY total DESC
    """, params)
    pagamentos = cursor.fetchall()
 
    # ── Produtos com estoque baixo ──────────────────────────
    cursor.execute("""
        SELECT nome, marca, categoria, estoque, estoque_minimo
        FROM produtos
        WHERE estoque <= estoque_minimo
        ORDER BY estoque ASC
        LIMIT 10
    """)
    estoque_baixo = cursor.fetchall()
 
    # ── Configurações da loja ───────────────────────────────
    cursor.execute("SELECT * FROM configuracoes WHERE id = 1")
    config = cursor.fetchone() or {}
 
    cursor.close()
    conn.close()

    return {
        "metricas": metricas,
        "ticket_medio": ticket_medio,
        "margem": margem,
        "top_produtos": top_produtos,
        "pagamentos": pagamentos,
        "estoque_baixo": estoque_baixo,
        "config": config
    }

#Formação de relatorio
LABELS_PERIODO = {
    "hoje": "Hoje",
    "7dias": "Últimos 7 dias",
    "30dias": "Últimos 30 dias",
    "tudo": "Todo o historico"
}

LABELS_PAGAMENTO = {
    "pix": "Pix",
    "cartao+credito": "Cartão de Crédito",
    "cartao+debito": "Cartão de Débito",
    "dinheiro": "Dinheiro",
    "outros": "Outro"
}

 # Top produtos
    if dados["top_produtos"]:
        linhas.append("🏆 *Top Produtos Mais Vendidos*")
        for i, p in enumerate(dados["top_produtos"], 1):
            nome = p["nome_produto"]
            marca = f" ({p['marca']})" if p["marca"] else ""
            linhas.append(
                f"  {i}. {nome}{marca}\n"
                f"     {p['qtd']} un · {formatar_brl(p['receita'])}"
            )
        linhas.append("")
 
    # Pagamentos
    if dados["pagamentos"]:
        linhas.append("━━━━━━━━━━━━━━━━━━━━━━")
        linhas.append("💳 *Formas de Pagamento*")
        for pg in dados["pagamentos"]:
            label = LABELS_PAGAMENTO.get(pg["forma_pagamento"], pg["forma_pagamento"])
            linhas.append(
                f"  • {label}: {formatar_brl(pg['total'])}  ({pg['qtd']} venda(s))"
            )
        linhas.append("")
 
    # Estoque baixo
    if dados["estoque_baixo"]:
        linhas.append("━━━━━━━━━━━━━━━━━━━━━━")
        linhas.append(f"⚠️ *Alerta de Estoque Baixo ({len(dados['estoque_baixo'])} item(s))*")
        for p in dados["estoque_baixo"]:
            status = "🔴 ESGOTADO" if p["estoque"] == 0 else f"🟡 {p['estoque']} un"
            linhas.append(
                f"  • {p['nome']}  →  {status}  (mín: {p['estoque_minimo']})"
            )
        linhas.append("")
    else:
        linhas.append("━━━━━━━━━━━━━━━━━━━━━━")
        linhas.append("✅ *Estoque:* todos os produtos em nível seguro.")
        linhas.append("")
 
    linhas.append("_Relatório gerado automaticamente pelo sistema de gestão._")
 
    return "\n".join(linhas)
 
 
# ─── ENVIO VIA WHATSAPP (Evolution API) ──────────────────────
def enviar_whatsapp(mensagem: str, numero: str) -> bool:
    """
    Envia mensagem via Evolution API (self-hosted).
    Docs: https://doc.evolution-api.com/v2/en/reference/send-text-message
 
    Se preferir usar outra API (Z-API, WPPConnect etc.),
    veja a seção OUTRAS OPÇÕES no final do arquivo.
    """
    if not all([EVOLUTION_URL, EVOLUTION_KEY, EVOLUTION_INSTANCE, numero]):
        print("❌  Configuração de WhatsApp incompleta. Verifique o .env")
        return False
 
    url = f"{EVOLUTION_URL}/message/sendText/{EVOLUTION_INSTANCE}"
    headers = {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_KEY,
    }
    payload = {
        "number": numero,
        "text":   mensagem,
    }
 
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        if resp.status_code in (200, 201):
            print(f"✅  Relatório enviado para {numero}")
            return True
        else:
            print(f"❌  Erro ao enviar: {resp.status_code} — {resp.text}")
            return False
    except requests.RequestException as e:
        print(f"❌  Falha de conexão: {e}")
        return False
 
 
# ─── ORQUESTRADOR ────────────────────────────────────────────
def gerar_e_enviar(periodo: str = "mes", numero: str = None):
    destino = numero or WHATSAPP_DESTINO
    print(f"[{datetime.now():%d/%m/%Y %H:%M}]  Gerando relatório ({LABELS_PERIODO.get(periodo, periodo)})…")
 
    try:
        dados = buscar_dados(periodo)
    except Exception as e:
        print(f"❌  Erro ao acessar banco de dados: {e}")
        return
 
    mensagem = montar_mensagem(dados, periodo)
 
    # Mostra prévia no terminal
    print("\n" + "─" * 50)
    print(mensagem)
    print("─" * 50 + "\n")
 
    if destino:
        enviar_whatsapp(mensagem, destino)
    else:
        print("ℹ️  Número de destino não configurado. Defina WHATSAPP_DESTINO no .env")
 
 
# ─── AGENDAMENTO ─────────────────────────────────────────────
def iniciar_agendamento(horario: str = "08:00", periodo: str = "mes"):
    print(f"⏰  Agendado: relatório diário às {horario} (período: {LABELS_PERIODO.get(periodo)})")
    schedule.every().day.at(horario).do(gerar_e_enviar, periodo=periodo)
    while True:
        schedule.run_pending()
        time.sleep(30)
 
 
# ─── MAIN ────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Relatório de Gestão de Estoque → WhatsApp")
    parser.add_argument("--agora",    action="store_true", help="Envia o relatório imediatamente")
    parser.add_argument("--agendar",  action="store_true", help="Inicia o envio diário agendado")
    parser.add_argument("--horario",  default="08:00",     help="Horário do agendamento (HH:MM). Padrão: 08:00")
    parser.add_argument("--periodo",  default="mes",       choices=["hoje", "7dias", "mes", "tudo"],
                                                            help="Período do relatório. Padrão: mes")
    parser.add_argument("--numero",   default=None,        help="Número de destino (substitui .env)")
 
    args = parser.parse_args()
 
    if args.agora:
        gerar_e_enviar(periodo=args.periodo, numero=args.numero)
    elif args.agendar:
        iniciar_agendamento(horario=args.horario, periodo=args.periodo)
    else:
        parser.print_help()