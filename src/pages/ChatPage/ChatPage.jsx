// import PropTypes from 'prop-types';
import styles from './ChatPage.module.css';
import NavBar from '../../components/NavBar/NavBar';
import ChatsList from '../../components/ChatsList/ChatsList';

function ChatPage() {


  return (
    <div className={styles.chatPage}>
      <NavBar/>
      <ChatsList />
    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};