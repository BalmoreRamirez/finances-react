import { useMemo } from 'react';
import './Accounts.css';
import { useAccounts } from '../../hooks/useAccounts';
import { useInvestments } from '../../hooks/useInvestments';
import { useAuth } from '../../context/AuthContext';

const formatCurrency = (value) => new Intl.NumberFormat('es-SV', {
	style: 'currency',
	currency: 'USD'
}).format(value || 0);

export const Accounts = ({ transactions = [], transactionsLoading }) => {
	const { summarizeAccountBalances } = useAccounts();
	const { user } = useAuth();
	const { purchases, credits, loading: investmentsLoading } = useInvestments(user?.uid);

		const summary = useMemo(() => summarizeAccountBalances({
			transactions,
			purchases,
			credits,
		}), [transactions, purchases, credits, summarizeAccountBalances]);

		const accountsWithDerivedValues = useMemo(() => {
			return summary.accounts.map(account => {
				if (account.id === 'inversion-ganancias') {
					return {
						...account,
						balance: summary.investmentProfitTotal,
						inflows: summary.investmentProfitTotal,
						outflows: 0,
					};
				}
				return account;
			});
		}, [summary.accounts, summary.investmentProfitTotal]);

	const loading = transactionsLoading || investmentsLoading;

	if (loading) {
		return (
			<div className="accounts-loading">
				<div className="spinner" aria-hidden="true" />
				<p>Calculando flujo contable...</p>
			</div>
		);
	}

		const totalIngresos = summary.accounts
			.filter(account => account.categoryKey === 'ingresos')
			.reduce((sum, account) => sum + account.outflows, 0);

		const totalGastos = summary.accounts
			.filter(account => account.categoryKey === 'gastos')
			.reduce((sum, account) => sum + account.inflows, 0);

	return (
		<div className="accounts-view">
			<section className="accounts-hero">
				<div>
					<p className="eyebrow">Plan de cuentas</p>
					<h3>Flujo entre activos, pasivos, patrimonio, ingresos y gastos</h3>
					<p className="subtitle">
						Cada transacción o inversión ahora se valida contra el plan de cuentas.
						Revisa cómo se mueve el dinero al entrar, invertirse y salir del sistema.
					</p>
				</div>
				<div className="accounts-hero-metrics">
					<div className="metric">
						<span>Entradas netas</span>
								<strong>{formatCurrency(summary.totals.debits)}</strong>
					</div>
					<div className="metric">
						<span>Salidas netas</span>
								<strong>{formatCurrency(summary.totals.credits)}</strong>
					</div>
					<div className="metric">
						<span>Ingresos registrados</span>
						<strong>{formatCurrency(totalIngresos)}</strong>
					</div>
					<div className="metric">
						<span>Gastos registrados</span>
						<strong>{formatCurrency(totalGastos)}</strong>
					</div>
				</div>
			</section>

					<section className="accounts-grid">
						{accountsWithDerivedValues.map((account) => (
					<article key={account.id} className="account-card" aria-label={`Cuenta ${account.label}`}>
						<div className="account-card-head">
							<div className="account-icon" aria-hidden="true" style={{ background: account.tone + '20', color: account.tone }}>
								{account.icon}
							</div>
							<div>
								<h4>{account.label}</h4>
								<p>{account.description}</p>
							</div>
						</div>
						<div className={`account-balance ${account.balance >= 0 ? 'positive' : 'negative'}`}>
							{formatCurrency(account.balance)}
						</div>
						<div className="account-flow-stats">
							<div>
								<span>Entradas</span>
								<strong>{formatCurrency(account.inflows)}</strong>
							</div>
							<div>
								<span>Salidas</span>
								<strong>{formatCurrency(account.outflows)}</strong>
							</div>
						</div>
					</article>
				))}
			</section>

			{summary.warnings.length > 0 && (
				<section className="accounts-warnings">
					<h4>Advertencias de flujo</h4>
					<p>Algunas operaciones usaron cuentas automáticas o carecían de datos. Revisa para mantener la trazabilidad.</p>
					<ul>
						{summary.warnings.map(warning => (
							<li key={`${warning.type}-${warning.id}`}>{warning.message}</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
};
