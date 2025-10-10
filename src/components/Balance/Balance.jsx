import './Balance.css';

export const Balance = ({ balance }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="balance-container">
      <div className="balance-card total">
        <div className="balance-icon">💵</div>
        <div className="balance-info">
          <h3>Balance Total</h3>
          <p className={balance.total >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(balance.total)}
          </p>
        </div>
      </div>

      <div className="balance-card income">
        <div className="balance-icon">📈</div>
        <div className="balance-info">
          <h3>Ingresos</h3>
          <p className="positive">{formatCurrency(balance.income)}</p>
        </div>
      </div>

      <div className="balance-card expense">
        <div className="balance-icon">📉</div>
        <div className="balance-info">
          <h3>Egresos</h3>
          <p className="negative">{formatCurrency(balance.expense)}</p>
        </div>
      </div>
    </div>
  );
};
