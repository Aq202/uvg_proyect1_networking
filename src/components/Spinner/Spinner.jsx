import './Spinner.css';
import PropTypes from 'prop-types';

function Spinner({ className }) {
  return (
    <div className={`spinner ${className}`}>
      <div />
    </div>
  );
}

export default Spinner;

Spinner.propTypes = {
  className: PropTypes.string,
}