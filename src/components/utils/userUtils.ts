export const getUserInitials = (firstName: string, lastName: string): string => {
    // Remove common prefixes
    const cleanFirstName = firstName.replace(/^(Dr\.|Pr\.|Dr\s|Pr\s)\s*/i, '');
    const cleanLastName = lastName.replace(/^(Dr\.|Pr\.|Dr\s|Pr\s)\s*/i, '');
  
    // Get first letters
    const firstInitial = cleanFirstName.charAt(0).toUpperCase();
    const lastInitial = cleanLastName.charAt(0).toUpperCase();
  
    return `${firstInitial}${lastInitial}`;
  };
  
  export const getUserFromStorage = (): { firstName: string; lastName: string } | null => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return null;
  
    try {
      const userData = JSON.parse(userDataString);
      return {
        firstName: userData.first_name,
        lastName: userData.last_name
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };