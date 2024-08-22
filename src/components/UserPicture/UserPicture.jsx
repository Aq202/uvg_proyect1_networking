import PropTypes from 'prop-types';
import styles from './UserPicture.module.css';

function UserPicture({
  name = "Usuario", 
  className = null, 
  onClick = null,
  showStatus = false,
  isActive = false,
}) {
  return (
    <div
      className={`${styles.userPicture} ${className}`}
      title={name}
      onClick={onClick}
    >
      <div className={`${styles.nameCircle} ${showStatus ? styles.showStatus : ''} ${isActive ? styles.active : ''}`}>{name ? name.charAt(0) : 'X'}</div>
    </div>
  );
}

export default UserPicture;

UserPicture.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  showStatus: PropTypes.bool,
};
