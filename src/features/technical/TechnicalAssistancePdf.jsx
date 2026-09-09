import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const colors = { navy: '#0f172a', slate: '#475569', line: '#cbd5e1', soft: '#f8fafc', blue: '#1d4ed8' };
const styles = StyleSheet.create({
  // Este documento é exibido no link público e precisa permanecer legível em uma única A4.
  page: { paddingTop: 28, paddingRight: 30, paddingBottom: 36, paddingLeft: 30, fontFamily: 'Helvetica', fontSize: 8, color: colors.navy },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logo: { width: 36, height: 36, marginRight: 8, objectFit: 'contain' },
  company: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  subtitle: { marginTop: 1, fontSize: 7, color: colors.slate },
  meta: { width: 150, textAlign: 'right', color: colors.slate, fontSize: 7, lineHeight: 1.3 },
  metaStrong: { fontFamily: 'Helvetica-Bold', color: colors.navy },
  title: { marginTop: 12, fontSize: 15, fontFamily: 'Helvetica-Bold', color: colors.navy },
  label: { fontSize: 6.3, fontFamily: 'Helvetica-Bold', color: colors.slate, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { marginTop: 2, fontSize: 8.2, fontFamily: 'Helvetica-Bold' },
  grid: { flexDirection: 'row', marginTop: 8 },
  cell: { flex: 1, padding: 6, borderWidth: 1, borderColor: colors.line, borderRadius: 4, marginLeft: 5 },
  wideCell: { flex: 2 },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: colors.blue, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 },
  paragraph: { fontSize: 7.2, color: colors.slate, lineHeight: 1.2 },
  table: { borderWidth: 1, borderColor: colors.line, borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.navy, color: '#ffffff', fontFamily: 'Helvetica-Bold', padding: 5 },
  row: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, padding: 5 },
  totalRow: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 5, fontFamily: 'Helvetica-Bold' },
  desc: { flex: 1 },
  qty: { width: 30, textAlign: 'right' },
  money: { width: 64, textAlign: 'right' },
  summary: { marginTop: 10, alignSelf: 'flex-end', width: 190, padding: 8, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line, borderRadius: 4 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, color: colors.slate, fontSize: 7.2 },
  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 5, marginTop: 3, fontFamily: 'Helvetica-Bold', fontSize: 10 },
  signatures: { flexDirection: 'row', marginTop: 18 },
  signature: { flex: 1, borderTopWidth: 1, borderTopColor: colors.navy, paddingTop: 5, textAlign: 'center', minHeight: 48 },
  signatureSecond: { marginLeft: 24 },
  signatureImage: { height: 28, marginBottom: -2, objectFit: 'contain' },
  footer: { position: 'absolute', bottom: 12, left: 30, right: 30, textAlign: 'center', color: colors.slate, fontSize: 6.2 },
});

const brl = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
const number = (value) => Number(value) || 0;
const date = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR') : '—';

export default function TechnicalAssistancePdf({ data, logoUrl, signatureDataUrl = '', signedAt = '' }) {
  const supplies = [...(data.supplies || [])].sort((a, b) => String(a.description || '').localeCompare(String(b.description || ''), 'pt-BR'));
  const services = [...(data.services || [])].sort((a, b) => String(a.description || '').localeCompare(String(b.description || ''), 'pt-BR'));
  const labor = number(data.pricing?.laborHours) * number(data.pricing?.laborRate);
  const suppliesTotal = supplies.reduce((sum, item) => sum + number(item.qty) * number(item.unitPrice), 0);
  const servicesTotal = services.reduce((sum, item) => sum + number(item.qty) * number(item.unitPrice), 0);
  const total = labor + suppliesTotal + servicesTotal;
  const line = (item) => <View style={styles.row} key={item.id} wrap={false}><Text style={styles.desc} maxLines={1}>{item.description || '-'}</Text><Text style={styles.qty}>{number(item.qty)}</Text><Text style={styles.money}>{brl(item.unitPrice)}</Text><Text style={styles.money}>{brl(number(item.qty) * number(item.unitPrice))}</Text></View>;
  const table = (title, items, subtotal) => <View style={styles.section} wrap={false}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.table}><View style={styles.tableHeader}><Text style={styles.desc}>Descrição</Text><Text style={styles.qty}>Qtd.</Text><Text style={styles.money}>Unit.</Text><Text style={styles.money}>Total</Text></View>{items.map(line)}<View style={styles.totalRow}><Text style={styles.desc}>Total de {title.toLowerCase()}</Text><Text style={styles.qty} /><Text style={styles.money} /><Text style={styles.money}>{brl(subtotal)}</Text></View></View></View>;

  return (
    <Document title={`Orçamento ${data.quote?.number || ''}`} author={data.company?.name || 'PL Tecnologia'}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} wrap={false}>
          <View style={styles.brand}>{logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}<View><Text style={styles.company} maxLines={1}>{data.company?.name || 'PL Tecnologia'}</Text><Text style={styles.subtitle}>Orçamento de Assistência Técnica</Text><Text style={styles.subtitle} maxLines={1}>{[data.company?.phone, data.company?.instagram].filter(Boolean).join(' · ')}</Text></View></View>
          <Text style={styles.meta}><Text style={styles.metaStrong}>Nº {data.quote?.number || '-'}{`\n`}</Text>Emissão: {date(data.quote?.issueDate)}{`\n`}Validade: {data.quote?.validityDays || 0} dias</Text>
        </View>
        <Text style={styles.title} maxLines={1}>Orçamento de Assistência Técnica</Text>
        <View style={styles.grid} wrap={false}><View style={styles.wideCell}><Text style={styles.label}>Cliente</Text><Text style={styles.value} maxLines={1}>{data.client?.name || '-'}</Text><Text style={styles.paragraph} maxLines={1}>{[data.client?.contact, data.client?.phone, data.client?.email].filter(Boolean).join(' · ') || ' '}</Text></View><View style={styles.cell}><Text style={styles.label}>Entrega</Text><Text style={styles.value} maxLines={1}>{number(data.delivery?.daysAfterApproval)} dias úteis</Text></View><View style={styles.cell}><Text style={styles.label}>Garantia</Text><Text style={styles.value} maxLines={1}>{number(data.warranty?.months)} {number(data.warranty?.months) === 1 ? 'mês' : 'meses'}</Text></View></View>
        <View style={styles.section} wrap={false}><Text style={styles.sectionTitle}>Atendimento</Text><View style={styles.grid} wrap={false}><View style={styles.wideCell}><Text style={styles.label}>Equipamento</Text><Text style={styles.value} maxLines={1}>{data.service?.equipment || '-'}</Text></View><View style={styles.cell}><Text style={styles.label}>Nº de série</Text><Text style={styles.value} maxLines={1}>{data.service?.serial || '-'}</Text></View></View><View style={[styles.cell, { marginLeft: 0, marginTop: 6 }]}><Text style={styles.label}>Reclamação / sintoma</Text><Text style={styles.paragraph} maxLines={2}>{data.service?.complaint || '-'}</Text></View></View>
        {table('Insumos', supplies, suppliesTotal)}
        {table('Serviços', services, servicesTotal)}
        <View style={styles.summary}><View style={styles.summaryLine}><Text>Insumos</Text><Text>{brl(suppliesTotal)}</Text></View><View style={styles.summaryLine}><Text>Serviços</Text><Text>{brl(servicesTotal)}</Text></View><View style={styles.summaryLine}><Text>Mão de obra</Text><Text>{brl(labor)}</Text></View><View style={styles.grandTotal}><Text>Total</Text><Text>{brl(total)}</Text></View></View>
        <View style={styles.section} wrap={false}><Text style={styles.sectionTitle}>Observações</Text><Text style={styles.paragraph} maxLines={2}>{data.notes || '-'}</Text></View>
        <View style={styles.signatures} wrap={false}><View style={styles.signature}>{signatureDataUrl ? <Image src={signatureDataUrl} style={styles.signatureImage} /> : null}<Text style={styles.metaStrong} maxLines={1}>{data.client?.name || 'Cliente'}</Text><Text style={styles.subtitle} maxLines={1}>Cliente{signedAt ? ` · Assinado em ${new Date(signedAt).toLocaleString('pt-BR')}` : ''}</Text></View><View style={[styles.signature, styles.signatureSecond]}><Text style={{ height: 28 }} /><Text style={styles.metaStrong} maxLines={1}>Pedro Luz</Text><Text style={styles.subtitle} maxLines={1}>{data.company?.name || 'PL Tecnologia'}</Text></View></View>
        <Text style={styles.footer}>Documento gerado pela PL Tecnologia · Assinatura eletrônica simples</Text>
      </Page>
    </Document>
  );
}
