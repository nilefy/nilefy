import { getToken, removeToken } from '@/lib/token.localstorage';
import { JwtPayload } from '@/types/auth.types';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'react-router-dom';

/**
 * as this loader runs before react renders we need to check for token first
 * if the user not authed will return `Response`
 */
export function loaderAuth() {
  const token = getToken();
  if (!token) {
    return redirect('/signin');
  } else {
    // check is the token still valid
    // Decode the token
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      removeToken();
      return redirect('/signin');
    }
  }
}
