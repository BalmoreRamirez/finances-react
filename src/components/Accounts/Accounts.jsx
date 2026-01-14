import { useMemo, useState } from 'react';
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
	const [selectedAccount, setSelectedAccount] = useState(null);

	const summary = useMemo(() => summarizeAccountBalances({
			transactions,
			purchases,
			credits,
	}), [transactions, purchases, credits, summarizeAccountBalances]);

	const accountsOverlay = useMemo(() => summary.accounts, [summary.accounts]);

	const visibleAccounts = useMemo(
		() => accountsOverlay.filter((account) => !account.hidden),
		[accountsOverlay]
	);

	const computeCreditPrincipal = (credit) => {
		const principalField = Number(credit.principalAmount);
		if (!Number.isNaN(principalField) && principalField > 0) return principalField;

		const total = Number(credit.totalAmount);
		const interest = Number(credit.interestAmount);
		if (!Number.isNaN(total) && !Number.isNaN(interest) && total > 0 && interest >= 0) {
			const candidate = total - interest;
			return candidate > 0 ? candidate : total;
		}

		return total || 0;
	};

	const accountHistory = useMemo(() => {
		if (!selectedAccount) return [];

		const base = transactions
			.filter((t) => t.fromAccountId === selectedAccount.id || t.toAccountId === selectedAccount.id)
			.map((t) => {
				const isInflow = t.toAccountId === selectedAccount.id;
				return {
					id: t.id,
					date: new Date(t.date),
					description: t.description,
					amount: Number(t.amount) || 0,
					type: t.type,
					direction: isInflow ? 'inflow' : 'outflow',
				};
			});

		const synthetic = [];
		if (selectedAccount.id === 'activos-fondo-inversiones') {
			purchases.forEach((p) => {
				const capital = Number(p.investment) || 0;
				if (capital > 0) {
					synthetic.push({
						id: `purchase-${p.id}`,
						date: p.date instanceof Date ? p.date : new Date(p.date),
						description: `Capital invertido: ${p.productName || p.description || 'Compra'}`,
						amount: capital,
						type: 'inversion',
						direction: 'outflow',
					});
				}
			});

			credits.forEach((c) => {
				const principal = Number(c.principalAmount ?? c.totalAmount) || 0;
				if (principal > 0) {
					synthetic.push({
						id: `credit-${c.id}`,
						date: c.date instanceof Date ? c.date : new Date(c.date),
						description: `Préstamo otorgado: ${c.clientName || 'Crédito'}`,
						amount: principal,
						type: 'credito',
						direction: 'outflow',
					});
				}

				const returned = Math.min(Number(c.totalPaid) || 0, principal);
				if (returned > 0) {
					synthetic.push({
						id: `credit-return-${c.id}`,
						date: c.date instanceof Date ? c.date : new Date(c.date),
						description: `Capital recuperado: ${c.clientName || 'Crédito'}`,
						amount: returned,
						type: 'credito',
						direction: 'inflow',
					});
				}
			});
		}

		return [...base, ...synthetic].sort((a, b) => b.date - a.date);
	}, [transactions, selectedAccount, purchases, credits]);

	const fundRetorno = useMemo(() => {
		const fundAccount = accountsOverlay.find((a) => a.id === 'activos-fondo-inversiones');
		if (!fundAccount) return { retorno: 0, inflowsAdj: 0 };

		const txReturns = transactions
			.filter((t) => t.toAccountId === 'activos-fondo-inversiones' && (
				t.autoSourceRole === 'investment-capital-return' || /devoluci[óo]n de capital/i.test(t.description || '')
			))
			.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

		const creditReturns = credits.reduce((sum, credit) => {
			const principal = computeCreditPrincipal(credit);
			const returned = Math.min(Number(credit.totalPaid) || 0, principal);
			return sum + Math.max(0, returned);
		}, 0);

		const retorno = txReturns + creditReturns;
		const inflowsAdj = Math.max(0, (fundAccount.inflows || 0) - retorno);
		return { retorno, inflowsAdj };
	}, [accountsOverlay, transactions, credits]);

	const categoryAccounts = useMemo(() => {
		const map = {};
		visibleAccounts.forEach((account) => {
			const key = account.categoryKey || 'otros';
			if (!map[key]) map[key] = [];
			const isFondo = account.id === 'activos-fondo-inversiones';
			map[key].push({
				id: account.id,
				label: account.label,
				inflows: isFondo ? fundRetorno.inflowsAdj : account.inflows,
				outflows: account.outflows,
				balance: account.balance,
				tone: account.tone,
			});
		});
		return map;
	}, [visibleAccounts, fundRetorno]);

	const totalIngresos = accountsOverlay
		.filter((account) => account.categoryKey === 'ingresos')
		.reduce((sum, account) => sum + account.outflows, 0);

	const totalGastos = accountsOverlay
		.filter((account) => account.categoryKey === 'gastos')
		.reduce((sum, account) => sum + account.inflows, 0);

	const categoryOrder = ['activos', 'pasivos', 'ingresos', 'gastos'];
	const categoryLabels = {
		activos: 'Activos',
		pasivos: 'Pasivos',
		ingresos: 'Ingresos',
		gastos: 'Gastos',
		otros: 'Otros'
	};

	const categoryTotals = useMemo(() => {
		const map = {};
		accountsOverlay.forEach((account) => {
			if (account.hidden) return;
			const key = account.categoryKey || 'otros';
			if (!map[key]) {
				map[key] = {
					key,
					label: categoryLabels[key] || categoryLabels.otros,
					inflows: 0,
					outflows: 0,
					balance: 0,
					tone: account.tone,
					count: 0,
				};
			}

			let inflowsAdj = account.inflows;
			let outflowsAdj = account.outflows;
			if (account.id === 'activos-fondo-inversiones') {
				inflowsAdj = fundRetorno.inflowsAdj;
			}

			map[key].inflows += inflowsAdj;
			map[key].outflows += outflowsAdj;
			map[key].balance += account.balance;
			if (!account.hidden) {
				map[key].count += 1;
			}
		});

		return Object.values(map).sort((a, b) => {
			const aIdx = categoryOrder.indexOf(a.key);
			const bIdx = categoryOrder.indexOf(b.key);
			if (aIdx === -1 && bIdx === -1) return a.label.localeCompare(b.label);
			if (aIdx === -1) return 1;
			if (bIdx === -1) return -1;
			return aIdx - bIdx;
		});
	}, [accountsOverlay, fundRetorno, categoryLabels, categoryOrder]);

	const assetsTotal = categoryTotals.find((c) => c.key === 'activos')?.balance || 0;
	const liabilitiesTotal = categoryTotals.find((c) => c.key === 'pasivos')?.balance || 0;
	const netAssets = assetsTotal - Math.abs(liabilitiesTotal);
	const equationGap = assetsTotal - Math.abs(liabilitiesTotal);
	const netFlow = summary.totals.debits - summary.totals.credits;

	const flowHealth = equationGap >= 0
		? 'Activos cubren pasivos'
		: 'Pasivos superan los activos';
	const ingresosVsGastos = totalIngresos - totalGastos;

		const loading = transactionsLoading || investmentsLoading;

		if (loading) {
			return (
				<div className="accounts-loading">
					<div className="spinner" aria-hidden="true" />
					<p>Calculando flujo contable...</p>
				</div>
			);
		}

	return (
		<div className="accounts-view">
			<section className="accounts-hero">
				<div>
					<p className="eyebrow">Plan de cuentas</p>
					<h3>Flujo entre activos, pasivos, ingresos y gastos</h3>
					<p className="subtitle">
						Cada movimiento usa el plan simplificado: caja, banco, fondo de inversiones; préstamos y TDC; ingresos y gastos clave.
					</p>
				</div>
				<div className="accounts-hero-metrics">
					<div className="metric">
						<span>Posición neta</span>
						<strong>{formatCurrency(netAssets)}</strong>
						<small>Activos - pasivos</small>
					</div>
					<div className="metric">
						<span>Flujo neto</span>
						<strong>{formatCurrency(netFlow)}</strong>
						<small>Entradas - salidas</small>
					</div>
					<div className="metric">
						<span>Salud contable</span>
						<strong>{flowHealth}</strong>
						<small>Diferencia: {formatCurrency(equationGap)}</small>
					</div>
					<div className="metric">
						<span>Ingresos vs gastos</span>
						<strong>{formatCurrency(ingresosVsGastos)}</strong>
						<small>Ingresos {formatCurrency(totalIngresos)} · Gastos {formatCurrency(totalGastos)}</small>
					</div>
				</div>
			</section>

		<section className="accounts-flow">
			<header className="section-heading">
				<div>
					<p className="eyebrow">Resumen por grupo</p>
					<h4>Cómo circula el dinero</h4>
				</div>
				<p className="section-helper">Entradas, salidas y saldos por categoría contable</p>
			</header>
			<div className="flow-grid">
				{categoryTotals.map((cat) => {
					const totalFlow = cat.inflows + cat.outflows;
					const inflowRatio = totalFlow > 0 ? (cat.inflows / totalFlow) * 100 : 0;
					return (
						<article key={cat.key} className="flow-card">
							<div className="flow-card-head">
								<div className="flow-dot" style={{ background: cat.tone || '#6366f1' }} aria-hidden="true" />
								<div>
									<p className="flow-eyebrow">{cat.label}</p>
									<strong className="flow-balance">{formatCurrency(cat.balance)}</strong>
									<span className="flow-sub">{cat.count} cuentas</span>
								</div>
							</div>
							<div className="flow-row">
								<span>Entradas</span>
								<strong>{formatCurrency(cat.inflows)}</strong>
							</div>
							<div className="flow-row">
								<span>Salidas</span>
								<strong>{formatCurrency(cat.outflows)}</strong>
							</div>
							<div className="flow-bar">
								<div className="flow-bar-fill" style={{ width: `${inflowRatio}%`, background: cat.tone || '#22c55e' }} />
							</div>
							{categoryAccounts[cat.key]?.length > 0 && (
								<div className="flow-detail">
									{categoryAccounts[cat.key].map((acc) => (
										<div key={acc.id} className="flow-detail-row">
											<div className="flow-detail-name">
												<span className="flow-detail-dot" style={{ background: acc.tone || '#6366f1' }} aria-hidden="true" />
												<span>{acc.label}</span>
											</div>
											<div className="flow-detail-amounts">
												<span>+ {formatCurrency(acc.inflows)}</span>
												<span>- {formatCurrency(acc.outflows)}</span>
											</div>
										</div>
									))}
								</div>
							)}
						</article>
					);
				})}
			</div>
		</section>

		<section className="accounts-grid">
			{visibleAccounts.map((account) => {
				const isFondo = account.id === 'activos-fondo-inversiones';
				const retorno = isFondo ? fundRetorno.retorno : 0;
				const displayInflows = isFondo ? fundRetorno.inflowsAdj : account.inflows;
				const totalFlow = displayInflows + account.outflows + retorno;
				const inflowRatio = totalFlow > 0 ? (displayInflows / totalFlow) * 100 : 0;
				return (
					<article
						key={account.id}
						className="account-card"
						aria-label={`Cuenta ${account.label}`}
						onClick={() => setSelectedAccount(account)}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedAccount(account); } }}
					>
						<div className="account-card-head">
							<div className="account-icon" aria-hidden="true" style={{ background: account.tone + '20', color: account.tone }}>
								{account.icon}
							</div>
							<div>
								<h4>{account.label}</h4>
								<p>{account.description}</p>
								<span className="account-tag">{categoryLabels[account.categoryKey] || 'Cuenta'}</span>
							</div>
						</div>
						<div className={`account-balance ${account.balance >= 0 ? 'positive' : 'negative'}`}>
							{formatCurrency(account.balance)}
						</div>
						<div className="account-flow-stats">
							<div>
								<span>Entradas</span>
								<strong>{formatCurrency(displayInflows)}</strong>
							</div>
							{isFondo && (
								<div>
									<span>Retorno</span>
									<strong>{formatCurrency(retorno)}</strong>
								</div>
							)}
							<div>
								<span>Salidas</span>
								<strong>{formatCurrency(account.outflows)}</strong>
							</div>
						</div>
						<div className="account-bar">
							<div className="account-bar-fill" style={{ width: `${inflowRatio}%`, background: account.tone || '#22c55e' }} />
							<span className="account-bar-label">{inflowRatio.toFixed(0)}% entradas</span>
						</div>
					</article>
				);
			})}
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

			{selectedAccount && (
				<div className="account-detail-overlay" role="dialog" aria-modal="true">
					<div className="account-detail">
						<header className="detail-head">
							<div>
								<p className="eyebrow">Historial</p>
								<h4>{selectedAccount.label}</h4>
								<small>{selectedAccount.description}</small>
							</div>
							<button className="detail-close" onClick={() => setSelectedAccount(null)}>Cerrar</button>
						</header>
						<div className="detail-list">
							{accountHistory.length === 0 && <p className="detail-empty">Sin movimientos para esta cuenta.</p>}
							{accountHistory.map((item) => (
								<div key={item.id} className="detail-row">
									<div>
										<p className="detail-date">{item.date.toLocaleDateString('es-ES')}</p>
										<p className="detail-desc">{item.description}</p>
									</div>
									<div className={`detail-amount ${item.direction === 'inflow' ? 'in' : 'out'}`}>
										{item.direction === 'inflow' ? '+' : '-'}{formatCurrency(item.amount)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
