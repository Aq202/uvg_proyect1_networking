import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import useXMPP from "../../hooks/useXMPP";
import AddButton from "../AddButton/AddButton";
import styles from "./ContactsList.module.css";
import ContactItem from "../ContactItem/ContactItem";

function ContactsList({ onSelectedUserChange = null }) {
	const { roster, userStates, subscriptionRequests, acceptSubscription, addContact } = useXMPP();
	const [selectedUser, setSelectedUser] = useState(null);

  const handleAcceptSubscription = (user) => {
    const res = confirm(`¿Desea agregar a ${user} a tus contactos?`);
    if(!res) return;

    const alias = prompt("Ingrese un apodo para este contacto");
    if(alias) acceptSubscription(user, alias);
  }

  const handleNewContact = () => {
    const user = prompt("Ingrese el nombre del usuario");
    if(!user) return;
    const alias = prompt("Ingrese un apodo para este contacto");
    if(alias) addContact(user, alias);
  }

	useEffect(() => {
		if (onSelectedUserChange) onSelectedUserChange(selectedUser);
	}, [selectedUser]);

  const rosterValues = Object.values(roster);
	const pendingContacts = rosterValues.filter((contact) => contact.subscription !== "both");
	const contacts = rosterValues.filter((contact) => contact.subscription === "both");

	return (
		<div className={styles.contactsList}>
			<header>
				<h1 className={styles.title}>Contactos</h1>
				<AddButton onClick={handleNewContact} title="Agregar nuevo contacto"/>
			</header>

      <div className={styles.listsContainer}>
      <ul className={styles.list}>
			{contacts.map((contact) => {

        const showActiveStatus = !!userStates[contact.user];
        const active = showActiveStatus && userStates[contact.user].available;
        const show = showActiveStatus ? userStates[contact.user].show : null;
        const status = showActiveStatus ? userStates[contact.user].status : null;
        
        return (
					<ContactItem
            key={contact.user}
						user={contact.user}
            alias={contact.alias}
						active={active}
						showActiveStatus={showActiveStatus}
            show={show ?? "Sin estado"}
            status={status}
            onClick={setSelectedUser}
					/>
        )})}
				</ul>

			{subscriptionRequests?.length > 0 && (
				<>
					<h3 className={styles.subtitle}>Solicitudes recibidas</h3>
					<ul className={styles.list}>
						{subscriptionRequests.map((user) => (
							<ContactItem
								key={user}
								user={user}
								showAcceptButton={true}
                onClick={setSelectedUser}
                onAcceptButtonClick={() => handleAcceptSubscription(user)}
							/>
						))}
					</ul>
				</>
			)}

			{pendingContacts?.length > 0 && (
				<>
					<h3 className={styles.subtitle}>Solicitudes pendientes</h3>
					<ul className={styles.list}>
						{pendingContacts.map((user) => (
							<ContactItem
								key={user.user}
								user={user.user}
                alias={user.alias}
                onClick={setSelectedUser}
							/>
						))}
					</ul>
				</>
			)}
      </div>
		</div>
	);
}

export default ContactsList;

ContactsList.propTypes = {
	onSelectedUserChange: PropTypes.func,
};
