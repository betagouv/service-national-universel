export const fillShortcut = (message, user, contact) => {
  return message
    .replace("#{user.firstname}", user.firstName)
    .replace("#{user.lastname}", user.lastName)
    .replace("#{ticket.customer.lastname}", contact.lastName)
    .replace("#{ticket.customer.firstname}", contact.firstName);
};
