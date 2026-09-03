import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { COMPANY, getInvestmentSummary } from './defaults';

Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  navy: '#0f172a',
  blue: '#1d4ed8',
  amber: '#f59e0b',
  slate: '#475569',
  light: '#f1f5f9',
  border: '#cbd5e1',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 76,
    paddingRight: 46,
    paddingBottom: 58,
    paddingLeft: 46,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.45,
    color: COLORS.navy,
    backgroundColor: COLORS.white,
  },
  cover: {
    padding: 54,
    fontFamily: 'Helvetica',
    color: COLORS.navy,
    backgroundColor: COLORS.white,
  },
  coverBand: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 18,
    backgroundColor: COLORS.amber,
  },
  coverTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coverLogoBox: { width: 132, height: 72, padding: 8, borderRadius: 6, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  coverLogo: { width: '100%', height: '100%', objectFit: 'contain' },
  coverNumber: { fontSize: 10, color: COLORS.slate, textAlign: 'right' },
  coverBody: { marginTop: 105 },
  eyebrow: { fontSize: 10, letterSpacing: 2.2, color: COLORS.blue, textTransform: 'uppercase' },
  coverTitle: { marginTop: 14, fontSize: 29, lineHeight: 1.15, fontFamily: 'Helvetica-Bold' },
  coverRule: { marginTop: 28, width: 78, height: 5, backgroundColor: COLORS.amber },
  coverClientLabel: { marginTop: 64, fontSize: 9, color: COLORS.slate, textTransform: 'uppercase', letterSpacing: 1.5 },
  coverClient: { marginTop: 8, fontSize: 19, fontFamily: 'Helvetica-Bold' },
  coverDate: { marginTop: 8, fontSize: 10, color: COLORS.slate },
  coverBottom: { position: 'absolute', left: 54, right: 54, bottom: 54, flexDirection: 'row', justifyContent: 'space-between' },
  coverContact: { fontSize: 8.5, color: COLORS.slate },
  header: {
    position: 'absolute',
    top: 24,
    left: 46,
    right: 46,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  headerLogo: { width: 78, height: 26, objectFit: 'contain' },
  headerMeta: { fontSize: 7.5, color: COLORS.slate, textAlign: 'right' },
  footer: {
    position: 'absolute',
    left: 46,
    right: 46,
    top: 805,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: COLORS.slate,
    fontSize: 7.5,
  },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: COLORS.navy, marginBottom: 16 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  paragraph: { color: COLORS.slate, marginBottom: 6, textAlign: 'justify' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  infoCell: { width: '50%', paddingRight: 12, paddingBottom: 9 },
  label: { fontSize: 7.5, color: COLORS.slate, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontFamily: 'Helvetica-Bold', color: COLORS.navy },
  moduleCard: { marginBottom: 15, borderWidth: 1, borderColor: COLORS.border, borderRadius: 5 },
  moduleHeader: { padding: 10, backgroundColor: '#eaf2ff', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  moduleNumber: { width: 25, fontFamily: 'Helvetica-Bold', color: COLORS.blue, fontSize: 12 },
  moduleTitle: { flex: 1, color: COLORS.navy, fontFamily: 'Helvetica-Bold', fontSize: 11 },
  moduleBody: { padding: 11 },
  subTitle: { marginTop: 7, marginBottom: 4, fontFamily: 'Helvetica-Bold', color: COLORS.navy, fontSize: 9 },
  bulletRow: { flexDirection: 'row', paddingLeft: 2, marginBottom: 3 },
  bullet: { width: 12, color: COLORS.amber, fontFamily: 'Helvetica-Bold' },
  bulletText: { flex: 1, color: COLORS.slate },
  moduleMeta: { marginTop: 9, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row' },
  moduleMetaCell: { flex: 1 },
  warning: { marginTop: 8, padding: 8, backgroundColor: '#fff7ed', color: '#9a3412', borderRadius: 3 },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, marginBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#eaf2ff', paddingVertical: 7, paddingHorizontal: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  tableMain: { flex: 1 },
  tableDuration: { width: 92, textAlign: 'right' },
  tableMoney: { width: 108, textAlign: 'right' },
  tableHeaderText: { color: COLORS.navy, fontFamily: 'Helvetica-Bold', fontSize: 8 },
  totalBox: { marginLeft: 'auto', width: 245, marginTop: 8, padding: 12, backgroundColor: COLORS.light, borderRadius: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: 'Helvetica-Bold', color: COLORS.navy },
  totalValue: { fontFamily: 'Helvetica-Bold', color: COLORS.blue, fontSize: 13 },
  small: { marginTop: 5, fontSize: 7.8, color: COLORS.slate },
  signatureRow: { marginTop: 52, flexDirection: 'row', gap: 28 },
  signature: { flex: 1, borderTopWidth: 1, borderTopColor: COLORS.navy, paddingTop: 7, textAlign: 'center' },
  signatureName: { fontFamily: 'Helvetica-Bold', marginBottom: 2 },
});

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatMoney(value) {
  const number = Number(value) || 0;
  if (number <= 0) return 'A definir';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
}

function Header({ quote, logoUrl, fixed = false }) {
  return (
    <View style={styles.header} fixed={fixed}>
      <Image src={logoUrl} style={styles.headerLogo} />
      <Text style={styles.headerMeta}>{quote.number || 'Sem número'}{`\n`}{quote.client.name || 'Cliente não informado'}</Text>
    </View>
  );
}

function Footer({ fixed = false }) {
  return (
    <View style={styles.footer} fixed={fixed}>
      <Text>PL Tecnologia · Assessoria Especializada em Engenharia</Text>
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}

function BulletList({ items = [] }) {
  return items.filter(Boolean).map((item, index) => (
    <View key={`${item}-${index}`} style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{item}</Text>
    </View>
  ));
}

export default function ConsultingPdf({ quote, logoUrl }) {
  const modules = [...(quote.selectedModules || [])].sort((a, b) => a.position - b.position);
  const investment = getInvestmentSummary(modules);

  return (
    <Document title={`${quote.title} - ${quote.client.name}`} author={COMPANY.name} subject="Proposta comercial de assessoria especializada">
      <Page size="A4" style={styles.cover}>
        <View style={styles.coverBand} />
        <View style={styles.coverTop}>
          <View style={styles.coverLogoBox}><Image src={logoUrl} style={styles.coverLogo} /></View>
          <Text style={styles.coverNumber}>PROPOSTA{`\n`}{quote.number || 'SEM NÚMERO'}</Text>
        </View>
        <View style={styles.coverBody}>
          <Text style={styles.eyebrow}>Engenharia · Processos · Automação</Text>
          <Text style={styles.coverTitle}>{quote.title}</Text>
          <View style={styles.coverRule} />
          <Text style={styles.coverClientLabel}>Preparada para</Text>
          <Text style={styles.coverClient}>{quote.client.name || 'Cliente a definir'}</Text>
          <Text style={styles.coverDate}>Emissão: {formatDate(quote.issueDate)}</Text>
        </View>
        <View style={styles.coverBottom}>
          <Text style={styles.coverContact}>{COMPANY.name}{`\n`}{COMPANY.responsible}</Text>
          <Text style={[styles.coverContact, { textAlign: 'right' }]}>{COMPANY.email}{`\n`}{COMPANY.phone}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <Header quote={quote} logoUrl={logoUrl} fixed />
        <Footer fixed />
        <Text style={styles.title}>Apresentação da proposta</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCell}><Text style={styles.label}>Contratante</Text><Text style={styles.value}>{quote.client.name || '—'}</Text></View>
          <View style={styles.infoCell}><Text style={styles.label}>Contato</Text><Text style={styles.value}>{quote.client.contact || '—'}</Text></View>
          <View style={styles.infoCell}><Text style={styles.label}>Documento</Text><Text style={styles.value}>{quote.client.document || '—'}</Text></View>
          <View style={styles.infoCell}><Text style={styles.label}>Proposta</Text><Text style={styles.value}>{quote.number || '—'}</Text></View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contexto</Text>
          <Text style={styles.paragraph}>{quote.context || 'Contexto a ser definido em conjunto com a contratante.'}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivo</Text>
          <Text style={styles.paragraph}>{quote.objective || 'Objetivo a definir.'}</Text>
        </View>
        {quote.executiveSummary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo executivo</Text>
            <Text style={styles.paragraph}>{quote.executiveSummary}</Text>
          </View>
        ) : null}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entregas transversais</Text>
          <Text style={styles.paragraph}>
            Todos os módulos incluem documentação específica. Ao final dos trabalhos será realizada uma visita presencial para validação das entregas, apresentação da documentação e treinamento da equipe da contratante.
          </Text>
          <Text style={styles.paragraph}>
            Deslocamento, alimentação e eventual hospedagem necessários para essa visita estão contemplados nos valores informados nos módulos, sem cobrança separada nesta proposta.
          </Text>
        </View>
      </Page>

      {modules.map((module, index) => (
        <Page key={module.id} size="A4" style={styles.page} wrap>
          <Header quote={quote} logoUrl={logoUrl} fixed />
          <Footer fixed />
          <Text style={styles.title}>Escopo · módulo {String(index + 1).padStart(2, '0')}</Text>
          <View style={styles.moduleCard}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleNumber}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.moduleTitle}>{module.title}</Text>
            </View>
            <View style={styles.moduleBody}>
              <Text style={styles.subTitle}>Objetivo</Text>
              <Text style={styles.paragraph}>{module.objective || 'A definir.'}</Text>
              <Text style={styles.subTitle}>Atividades</Text>
              <BulletList items={module.activities} />
              <Text style={styles.subTitle}>Entregáveis</Text>
              <BulletList items={module.deliverables} />
              {module.exclusions ? <Text style={styles.warning}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Limites do escopo: </Text>{module.exclusions}</Text> : null}
              <View style={styles.moduleMeta} wrap={false}>
                <View style={styles.moduleMetaCell}><Text style={styles.label}>Duração estimada</Text><Text style={styles.value}>{Number(module.duration) > 0 ? `${module.duration} ${module.durationUnit}` : 'A definir'}</Text></View>
                <View style={styles.moduleMetaCell}><Text style={styles.label}>Investimento</Text><Text style={styles.value}>{formatMoney(module.investment)}</Text></View>
              </View>
            </View>
          </View>
        </Page>
      ))}

      <Page size="A4" style={styles.page} wrap>
        <Header quote={quote} logoUrl={logoUrl} fixed />
        <Footer fixed />
        <Text style={styles.title}>Investimento e condições</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo dos módulos</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableMain, styles.tableHeaderText]}>Módulo</Text>
              <Text style={[styles.tableDuration, styles.tableHeaderText]}>Prazo</Text>
              <Text style={[styles.tableMoney, styles.tableHeaderText]}>Investimento</Text>
            </View>
            {modules.map((module) => (
              <View key={module.id} style={styles.tableRow} wrap={false}>
                <Text style={styles.tableMain}>{module.title}</Text>
                <Text style={styles.tableDuration}>{Number(module.duration) > 0 ? `${module.duration} ${module.durationUnit}` : 'A definir'}</Text>
                <Text style={styles.tableMoney}>{formatMoney(module.investment)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalBox} wrap={false}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{investment.label}</Text>
              <Text style={styles.totalValue}>{investment.priced.length ? formatMoney(investment.total) : 'A definir'}</Text>
            </View>
            {investment.unpriced.length > 0 && investment.priced.length > 0 ? <Text style={styles.small}>O total é parcial. {investment.unpriced.length} módulo(s) permanece(m) com investimento a definir e não está(ão) incluído(s) no valor acima.</Text> : null}
            {investment.priced.length === 0 ? <Text style={styles.small}>Os investimentos dos módulos selecionados serão definidos antes da contratação.</Text> : null}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cronograma e pagamento</Text>
          <Text style={styles.paragraph}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Prazo global: </Text>{quote.overallTimeline || 'A definir.'}</Text>
          <Text style={styles.paragraph}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Condição de pagamento: </Text>{quote.paymentTerms || 'A definir.'}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premissas</Text>
          <Text style={styles.paragraph}>{quote.assumptions || 'Sem premissas adicionais.'}</Text>
        </View>
        {quote.notes ? <View style={styles.section}><Text style={styles.sectionTitle}>Observações</Text><Text style={styles.paragraph}>{quote.notes}</Text></View> : null}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aceite</Text>
          <Text style={styles.paragraph}>
            A assinatura abaixo formaliza o aceite do escopo e das condições desta proposta. Local: {quote.acceptanceLocation || '________________________'}, data: ____/____/________.
          </Text>
          <View style={styles.signatureRow} wrap={false}>
            <View style={styles.signature}><Text style={styles.signatureName}>{quote.client.name || 'Contratante'}</Text><Text>Contratante</Text></View>
            <View style={styles.signature}><Text style={styles.signatureName}>{COMPANY.responsible}</Text><Text>{COMPANY.name}</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
