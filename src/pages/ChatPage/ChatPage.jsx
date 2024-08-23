// import PropTypes from 'prop-types';
import styles from './ChatPage.module.css';
import NavBar from '../../components/NavBar/NavBar';
import ChatsList from '../../components/ChatsList/ChatsList';
import SingleChat from '../../components/SingleChat/SingleChat';
import { useState } from 'react';
import useSession from '../../hooks/useSession';
import ContactsList from '../../components/ContactsList/ContactsList';

const menuOption = {
  CHATS: 'CHATS',
  GROUPS: 'GROUPS',
  CONTACTS: 'CONTACTS',
  PROFILE: 'PROFILE',
};
function ChatPage() {

  const [selectedOption, setSelectedOption] = useState(menuOption.CHATS);
  const [currentSingleChat, setCurrentSingleChat] = useState(null);

  const {logout} = useSession();


  return (
    <div className={styles.chatPage}>
      <NavBar 
        onChatOptionClick={() => setSelectedOption(menuOption.CHATS)}
        onGroupChatOptionClick={() => setSelectedOption(menuOption.GROUPS)}
        onContactsOptionClick={() => setSelectedOption(menuOption.CONTACTS)}
        onProfileOptionClick={() => setSelectedOption(menuOption.PROFILE)}
        onExitOptionClick={logout}
      />
      {selectedOption === menuOption.CHATS && <ChatsList onSelectedUserChange={setCurrentSingleChat}/>}
      {selectedOption === menuOption.CONTACTS && <ContactsList onSelectedUserChange={setCurrentSingleChat} />}
      {currentSingleChat && <SingleChat user={currentSingleChat}/>}

    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};