exports.handler = async (event) => {
  // Auto-confirm all users for development
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  
  return event;
};
