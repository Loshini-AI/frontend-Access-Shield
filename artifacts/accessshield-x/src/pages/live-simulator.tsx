import LiveScenario from '@/pages/live-scenario';
import { Head } from '@/pages/live-ui';

export default function LiveSimulator() {
  return (
    <>
      <Head eyebrow="WHAT-IF ANALYSIS / LIVE" title="Scenario Simulator" sub="Add an access event, re-run the audit engine, and watch the recommendation adapt." />
      <LiveScenario />
    </>
  );
}