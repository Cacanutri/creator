import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Steps from "@/components/Steps";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <Card className="p-6 md:p-10">
          <Badge variant="verified">Plataforma oficial</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Conecte Criadores e Patrocinadores em parcerias sob medida.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-300">
            Criadores publicam ofertas. Marcas filtram, solicitam proposta e negociam direto no painel.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/vitrine">
              <Button>Explorar Vitrine</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Entrar / Criar conta</Button>
            </Link>
          </div>
        </Card>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="text-sm font-semibold text-zinc-100">Como funciona para Criadores</div>
            <div className="mt-4">
              <Steps
                steps={[
                  "Crie sua oferta com entregaveis claros.",
                  "Publique na vitrine para aparecer nas buscas.",
                  "Receba pedidos e feche negociacoes no painel.",
                ]}
              />
            </div>
          </Card>
          <Card>
            <div className="text-sm font-semibold text-zinc-100">Como funciona para Patrocinadores</div>
            <div className="mt-4">
              <Steps
                steps={[
                  "Encontre creators na vitrine com filtros.",
                  "Solicite proposta dentro de uma oferta.",
                  "Acompanhe status e respostas no painel.",
                ]}
              />
            </div>
          </Card>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card>
            <div className="text-sm font-semibold text-zinc-100">O que voce encontra na Vitrine</div>
            <ul className="mt-4 grid gap-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Ofertas por plataforma (YouTube, TikTok, Instagram).
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Nicho e localizacao para parcerias locais.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Preco a partir de e entregaveis claros.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Pedido de proposta registrado, sem perder conversas.
              </li>
            </ul>
          </Card>
          <Card>
            <div className="text-sm font-semibold text-zinc-100">Seguranca e transparencia</div>
            <ul className="mt-4 grid gap-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Historico de propostas no painel.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Voce controla o que publica.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Sem anuncios invasivos. Negociacao direta e objetiva.
              </li>
            </ul>
          </Card>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_2fr]">
          <Card>
            <div className="text-sm font-semibold text-zinc-100">Onde clicar</div>
            <div className="mt-4 grid gap-2">
              <Link href="/vitrine">
                <Button size="sm">Vitrine</Button>
              </Link>
              <Link href="/dashboard/creator/offers/new">
                <Button size="sm" variant="secondary">
                  Criar oferta
                </Button>
              </Link>
              <Link href="/vitrine">
                <Button size="sm" variant="ghost">
                  Solicitar proposta
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" variant="ghost">
                  Painel
                </Button>
              </Link>
            </div>
          </Card>
          <Card>
            <div className="text-sm font-semibold text-zinc-100">Proximos passos</div>
            <p className="mt-2 text-sm text-zinc-300">
              Se voce e creator, crie sua oferta e publique na vitrine. Se voce e marca, explore
              ofertas e solicite propostas para iniciar a conversa.
            </p>
          </Card>
        </div>

        <div className="mt-10">
          <div className="text-sm font-semibold text-zinc-100">FAQ rapido</div>
          <div className="mt-4 grid gap-3">
            {faqItems.map((item) => (
              <Card key={item.q} className="p-0">
                <details className="group p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-100">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-sm text-zinc-300">{item.a}</p>
                </details>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-10 p-6 text-center">
          <h2 className="text-xl font-semibold">Comecar agora</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Escolha seu caminho e avance com seguranca.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/creator/offers/new">
              <Button>Criar oferta</Button>
            </Link>
            <Link href="/vitrine">
              <Button variant="secondary">Explorar vitrine</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

const faqItems = [
  {
    q: "Sou creator. Preciso ter CNPJ?",
    a: "Depende do seu modelo. A plataforma nao exige CNPJ no MVP.",
  },
  {
    q: "Como o patrocinador entra em contato?",
    a: "Por meio do botao Solicitar proposta dentro de uma oferta.",
  },
  {
    q: "Como recebo os pedidos?",
    a: "No inbox do painel do creator, com status e historico.",
  },
  {
    q: "A plataforma cobra taxa?",
    a: "No momento, nao. No futuro, podemos ter planos ou fees.",
  },
  {
    q: "Posso deixar ofertas privadas?",
    a: "Sim. Voce controla a publicacao usando a opcao Publica/Privada.",
  },
  {
    q: "Posso filtrar por cidade/estado?",
    a: "Sim. Existem filtros por cidade/UF e raio com Perto de mim.",
  },
];
