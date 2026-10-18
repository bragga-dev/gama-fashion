import { LEGAL } from '@/lib/legal'
import { LegalPage } from './LegalPage'

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso" sections={[
      { title: 'Aceitação', body: [`Ao criar uma conta ou comprar na loja ${LEGAL.company} (CNPJ ${LEGAL.cnpj}), você declara ter lido e aceitado estes Termos. Se não concordar, não utilize o site.`] },
      { title: 'Cadastro e conta', body: ['Você deve informar dados verdadeiros e manter sua senha em sigilo. A conta é pessoal e intransferível, e você responde pelas atividades realizadas com ela.', 'Podemos suspender contas com indícios de fraude, uso indevido ou violação destes Termos.'] },
      { title: 'Produtos, preços e estoque', body: ['As fotos e descrições buscam retratar fielmente os produtos; pequenas variações de cor podem ocorrer conforme a tela do dispositivo.', 'Os preços e a disponibilidade podem mudar sem aviso. O estoque é confirmado ao criar o pedido; em caso de indisponibilidade, o pedido pode ser cancelado com reembolso integral.'] },
      { title: 'Pedidos e pagamento', body: ['O pedido é criado após a escolha do endereço e da forma de envio, e fica pendente até a confirmação do pagamento. O pagamento pode ser feito por PIX, boleto ou cartão de crédito, processado pela Asaas.', 'Pedidos com pagamento não confirmado dentro do prazo são cancelados e o estoque é devolvido.'] },
      { title: 'Entrega', body: ['O frete e o prazo são calculados pelo CEP informado e começam a contar após a confirmação do pagamento. O prazo é uma estimativa das transportadoras e pode variar por fatores externos.', 'Você é responsável por informar um endereço correto e completo.'] },
      { title: 'Troca, devolução e arrependimento', body: ['Em compras feitas pela internet, você pode desistir da compra em até 7 dias corridos do recebimento (art. 49 do Código de Defesa do Consumidor), com reembolso dos valores pagos.', 'Para trocas por tamanho ou defeito, entre em contato pelo e-mail ' + LEGAL.email + ' ou pelo formulário "Fale conosco", informando o número do pedido.'] },
      { title: 'Avaliações', body: ['Somente clientes com pedido entregue podem avaliar. As avaliações passam por moderação e podem ser recusadas quando forem ofensivas, falsas ou alheias ao produto.'] },
      { title: 'Propriedade intelectual', body: ['Marca, logotipos, textos, fotos e layout do site pertencem à loja ou a seus licenciantes e não podem ser copiados ou usados sem autorização.'] },
      { title: 'Privacidade', body: ['O tratamento dos seus dados pessoais é descrito na Política de Privacidade, que integra estes Termos.'] },
      { title: 'Alterações e foro', body: ['Podemos atualizar estes Termos a qualquer momento; a versão vigente é a publicada nesta página.', `Fica eleito o foro de ${LEGAL.forum}, ressalvado o foro do domicílio do consumidor previsto em lei.`] },
    ]} />
  )
}