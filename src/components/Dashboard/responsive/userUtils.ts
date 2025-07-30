// userUtils.ts
export interface UserData {
  doctor_id: number | null;
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  password: string;
  roles: Array<{ id: number; name: string }>;
  username: string;
  // Adding camelCase versions for compatibility
  firstName?: string;
  lastName?: string;
}

export const getUserFromStorage = (): UserData | null => {
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return null;
    }
    
    const parsedData = JSON.parse(userData);
    
    // Ensure both snake_case and camelCase versions exist for compatibility
    const normalizedData = {
      ...parsedData,
      firstName: parsedData.first_name || parsedData.firstName,
      lastName: parsedData.last_name || parsedData.lastName,
    };
    
    return normalizedData;
  } catch (error) {
    console.error('Failed to parse user data from localStorage:', error);
    return null;
  }
};

export const getUserInitials = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) {
    return 'UN'; // Unknown user
  }

  // Remove common prefixes from the first name
  const cleanFirstName = firstName.replace(/^(Dr\.|Pr\.|Dr\s|Pr\s)\s*/i, '').trim();
  const cleanLastName = lastName.trim();

  const firstInitial = cleanFirstName.charAt(0).toUpperCase();
  const lastInitial = cleanLastName.charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
};


export const getUserFullName = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) {
    return 'User Name';
  }
  
  return `${firstName.trim()} ${lastName.trim()}`;
};

// Debug function to check localStorage data
export const debugUserData = (): void => {
  const userData = localStorage.getItem('userData');
  console.log('Raw userData from localStorage:', userData);
  
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      console.log('Parsed userData:', parsed);
      console.log('first_name:', parsed.first_name);
      console.log('last_name:', parsed.last_name);
    } catch (error) {
      console.error('Error parsing userData:', error);
    }
  }
};