import type { Metadata } from 'next';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'System Status — Scriverly',
  description: 'Live operational status for all Scriverly services.',
};

const services = [
  { name: 'Web application', status: 'operational' },
  { name: 'Authentication', status: 'operational' },
  { name: 'AI analysis engine', status: 'operational' },
  { name: 'Essay storage', status: 'operational' },
  { name: 'Billing and payments', status: 'operational' },
  { name: 'Email delivery', status: 'operational' },
  { name: 'API', status: 'operational' },
];

const incidents: { date: string; title: string; body: string }[] = [
  // No incidents to report at launch.
];

const statusLabel: Record<string, string> = {
  operational: 'Operational',
  degraded: 'Degraded performance',
  partial: 'Partial outage',
  outage: 'Major outage',
  maintenance: 'Under maintenance',
};

export default function StatusPage() {
  const allOperational = services.every(s => s.status === 'operational');

  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Status</p>
          <h1 className={page.proseTitle}>System status</h1>
          <p className={page.proseSubtitle}>
            Current operational status for all Scriverly services. This page is updated
            manually during incidents.
          </p>
        </header>

        {/* Overall banner */}
        <div
          className={
            allOperational ? page.statusBannerGood : page.statusBannerIssue
          }
          role="status"
        >
          <span className={page.statusBannerDot} aria-hidden="true" />
          <strong>
            {allOperational
              ? 'All systems are operational'
              : 'One or more services are experiencing issues'}
          </strong>
        </div>

        {/* Service table */}
        <div className={page.statusTable}>
          {services.map(service => (
            <div key={service.name} className={page.statusRow}>
              <span className={page.statusServiceName}>{service.name}</span>
              <span
                className={
                  service.status === 'operational'
                    ? page.statusBadgeGood
                    : page.statusBadgeBad
                }
              >
                {statusLabel[service.status] ?? service.status}
              </span>
            </div>
          ))}
        </div>

        {/* Incident history */}
        <div className={page.proseBody} style={{ marginTop: '3rem' }}>
          <h2>Incident history</h2>
          {incidents.length === 0 ? (
            <p>No incidents have been recorded yet.</p>
          ) : (
            incidents.map(incident => (
              <div key={incident.date}>
                <h3>{incident.title}</h3>
                <p className={page.proseMeta}>{incident.date}</p>
                <p>{incident.body}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
