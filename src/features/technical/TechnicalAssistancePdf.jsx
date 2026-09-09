import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const colors = { navy: '#0f172a', slate: '#475569', line: '#cbd5e1', soft: '#f8fafc', blue: '#1d4ed8' };
const styles = StyleSheet.create({
  page: { padding: 42, fontFamily: 'Helvetica', fontSize: 9, color: colors.navy },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 14 },
  brand: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  logo: { width: 46, height: 46, objectFit: 'contain' },
  company: { fontSize: 17, fontFamily: 'Helvetica-Bold' },
  subtitle: { marginTop: 3, fontSize: 8, color: colors.slate },
  meta: { textAlign: 'right', color: colors.slate, fontSize: 8, lineHeight: 1.5 },
  metaStrong: { fontFamily: 'Helvetica-Bold', color: colors.navy },
  title: { marginTop: 22, fontSize: 20, fontFamily: 'Helvetica-Bold', color: colors.navy },
  label: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: colors.slate, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { marginTop: 3, fontSize: 10, fontFamily: 'Helvetica-Bold' },
  grid: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cell: { flex: 1, padding: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 4 },
  wideCell: { flex: 2 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.blue, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 },
  paragraph: { color: colors.slate, lineHeight: 1.45 },
  table: { borderWidth: 1, borderColor: colors.line, borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.navy, color: '#ffffff', fontFamily: 'Helvetica-Bold', padding: 7 },
  row: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, padding: 7 },
  totalRow: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 7, fontFamily: 'Helvetica-Bold' },
  desc: { flex: 3 },
  qty: { width: 42, textAlign: 'right' },
  money: { width: 76, textAlign: 'right' },
  summary: { marginTop: 18, alignSelf: 'flex-end', width: 220, padding: 12, backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.line, borderRadius: 4 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, color: colors.slate },
  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 7, marginTop: 4, fontFamily: 'Helvetica-Bold', fontSize: 12 },
  signatures: { flexDirection: 'row', gap: 30, marginTop: 48 },
  signature: { flex: 1, borderTopWidth: 1, borderTopColor: colors.navy, paddingTop: 7, textAlign: 'center', minHeight: 62 },
  signatureImage: { height: 42, marginBottom: -4, objectFit: 'contain' },
  footer: { position: 'absolute', bottom: 24, left: 42, right: 42, textAlign: 'center', color: colors.slate, fontSize: 7 },
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
  const line = (item) => <View style={styles.row} key={item.id}><Text style={styles.desc}>{item.description || '—'}</Text><Text style={styles.qty}>{number(item.qty)}</Text><Text style={styles.money}>{brl(item.unitPrice)}</Text><Text style={styles.money}>{brl(number(item.qty) * number(item.unitPrice))}</Text></View>;
  const table = (title, items, subtotal) => <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.table}><View style={styles.tableHeader}><Text style={styles.desc}>Descrição</Text><Text style={styles.qty}>Qtd.</Text><Text style={styles.money}>Unit.</Text><Text style={styles.money}>Total</Text></View>{items.map(line)}<View style={styles.totalRow}><Text style={styles.desc}>Total de {title.toLowerCase()}</Text><Text style={styles.qty} /><Text style={styles.money} /><Text style={styles.money}>{brl(subtotal)}</Text></View></View></View>;

  return (
    <Document title={`Orçamento ${data.quote?.number || ''}`} author={data.company?.name || 'PL Tecnologia'}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>{logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}<View><Text style={styles.company}>{data.company?.name || 'PL Tecnologia'}</Text><Text style={styles.subtitle}>Orçamento de Assistência Técnica</Text><Text style={styles.subtitle}>{[data.company?.phone, data.company?.instagram].filter(Boolean).join(' · ')}</Text></View></View>
          <Text style={styles.meta}><Text style={styles.metaStrong}>Nº {data.quote?.number || '—'}{`\n`}</Text>Emissão: {date(data.quote?.issueDate)}{`\n`}Validade: {data.quote?.validityDays || 0} dias</Text>
        </View>
        <Text style={styles.title}>Orçamento de Assistência Técnica</Text>
        <View style={styles.grid}><View style={styles.wideCell}><Text style={styles.label}>Cliente</Text><Text style={styles.value}>{data.client?.name || '—'}</Text><Text style={styles.paragraph}>{[data.client?.contact, data.client?.phone, data.client?.email].filter(Boolean).join(' · ') || ' '}</Text></View><View style={styles.cell}><Text style={styles.label}>Entrega</Text><Text style={styles.value}>{number(data.delivery?.daysAfterApproval)} dias úteis</Text></View><View style={styles.cell}><Text style={styles.label}>Garantia</Text><Text style={styles.value}>{number(data.warranty?.months)} {number(data.warranty?.months) === 1 ? 'mês' : 'meses'}</Text></View></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Atendimento</Text><View style={styles.grid}><View style={styles.wideCell}><Text style={styles.label}>Equipamento</Text><Text style={styles.value}>{data.service?.equipment || '—'}</Text></View><View style={styles.cell}><Text style={styles.label}>Nº de série</Text><Text style={styles.value}>{data.service?.serial || '—'}</Text></View></View><View style={[styles.cell, { marginTop: 10 }]}><Text style={styles.label}>Reclamação / sintoma</Text><Text style={styles.paragraph}>{data.service?.complaint || '—'}</Text></View></View>
        {table('Insumos', supplies, suppliesTotal)}
        {table('Serviços', services, servicesTotal)}
        <View style={styles.summary}><View style={styles.summaryLine}><Text>Insumos</Text><Text>{brl(suppliesTotal)}</Text></View><View style={styles.summaryLine}><Text>Serviços</Text><Text>{brl(servicesTotal)}</Text></View><View style={styles.summaryLine}><Text>Mão de obra</Text><Text>{brl(labor)}</Text></View><View style={styles.grandTotal}><Text>Total</Text><Text>{brl(total)}</Text></View></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Observações</Text><Text style={styles.paragraph}>{data.notes || '—'}</Text></View>
        <View style={styles.signatures}><View style={styles.signature}>{signatureDataUrl ? <Image src={signatureDataUrl} style={styles.signatureImage} /> : null}<Text style={styles.metaStrong}>{data.client?.name || 'Cliente'}</Text><Text style={styles.subtitle}>Cliente{signedAt ? ` · Assinado em ${new Date(signedAt).toLocaleString('pt-BR')}` : ''}</Text></View><View style={styles.signature}><Text style={{ height: 42 }} /><Text style={styles.metaStrong}>Pedro Luz</Text><Text style={styles.subtitle}>{data.company?.name || 'PL Tecnologia'}</Text></View></View>
        <Text style={styles.footer}>Documento gerado pela PL Tecnologia · Assinatura eletrônica simples</Text>
      </Page>
    </Document>
  );
}
