import { LEGAL } from '@/lib/legal'
import { LegalPage } from './LegalPage'

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade" sections={[
      { title: 'Quem somos', body: [`${LEGAL.company} (CNPJ ${LEGAL.cnpj}) é a controladora dos dados pessoais tratados neste site, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Contato do encarregado: ${LEGAL.email}.`] },
      { title: 'Dados que coletamos', body: ['Cadastro: e-mail, senha (armazenada de forma criptografada), nome, nome de usuário, telefone, CPF, data de nascimento e gênero (quando informados) e foto de perfil.', 'Entrega e compra: endereços, itens, valores e histórico de pedidos, avaliações e mensagens enviadas pelo formulário de contato.', 'Login com Google: e-mail e nome associados à sua conta Google, mediante sua autorização.', 'Técnicos: dispositivo e data de acesso das sessões, usados para segurança.'] },
      { title: 'Para que usamos', body: ['Criar e proteger sua conta; processar pedidos, pagamentos e entregas; enviar e-mails sobre sua conta e seus pedidos; atender seus contatos; cumprir obrigações legais e fiscais; prevenir fraudes.', 'Enviamos novidades e ofertas somente se você tiver marcado essa opção, que pode ser retirada a qualquer momento.'] },
      { title: 'Bases legais', body: ['Execução de contrato (compras e conta), cumprimento de obrigação legal, legítimo interesse (segurança e prevenção a fraudes) e consentimento (comunicações de marketing e login com Google).'] },
      { title: 'Com quem compartilhamos', body: ['Asaas: processamento de pagamentos. Frenet e transportadoras: cálculo de frete e entrega. Google: autenticação, quando você escolhe o login com Google. Provedores de infraestrutura e de envio de e-mail, somente para operar o serviço.', 'Não vendemos seus dados pessoais.'] },
      { title: 'Cookies', body: ['Usamos um cookie essencial e protegido (httpOnly) para manter sua sessão. Não usamos cookies de publicidade ou de análise. O login com Google pode definir cookies do próprio Google.'] },
      { title: 'Armazenamento e segurança', body: ['Adotamos criptografia em trânsito (HTTPS), senhas com hash, controle de acesso e sessões com expiração. Mantemos os dados pelo tempo necessário às finalidades acima e às obrigações legais (por exemplo, registros fiscais).'] },
      { title: 'Seus direitos', body: ['Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação dos dados tratados com consentimento, informação sobre compartilhamento e revogação do consentimento (art. 18 da LGPD).', `Para exercer seus direitos, escreva para ${LEGAL.email}. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`] },
      { title: 'Crianças e adolescentes', body: ['O site não é direcionado a menores de 18 anos; compras por menores exigem a participação de um responsável.'] },
      { title: 'Alterações', body: ['Esta política pode ser atualizada; a data da última revisão consta no topo da página.'] },
    ]} />
  )
}