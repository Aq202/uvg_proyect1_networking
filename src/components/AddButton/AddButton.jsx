import PropTypes from 'prop-types';
import styles from './AddButton.module.css';
import { FaPlus as AddIcon } from "react-icons/fa";

function AddButton({onClick, title="Nuevo"}) {
  return (
    <button type='button' className={styles.addButton} onClick={onClick} title={title}>
      <AddIcon />
    </button>
  );
}

export default AddButton;

AddButton.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string,
};
