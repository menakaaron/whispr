"use client";

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

function getPool() {
  if (!userPoolId || !clientId) throw new Error("Missing Cognito env vars");
  return new CognitoUserPool({ UserPoolId: userPoolId, ClientId: clientId });
}

export function getCognitoUser(username: string): CognitoUser {
  return new CognitoUser({
    Username: username,
    Pool: getPool(),
  });
}

export type SignUpParams = {
  email: string;
  password: string;
  nativeLanguage: string;
  targetLanguage: string;
  proficiencyLevel: string;
  learningGoals: string[];
};

export function signUp(params: SignUpParams): Promise<{ userSub: string }> {
  const pool = getPool();
  const { email, password } = params;

  const attributes: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: "email", Value: email }),
    new CognitoUserAttribute({ Name: "preferred_username", Value: email }),
  ];

  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attributes, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result?.userSub) {
        reject(new Error("Sign up succeeded but no user sub"));
        return;
      }
      resolve({ userSub: result.userSub });
    });
  });
}

export function signIn(email: string, password: string): Promise<{ idToken: string; accessToken: string }> {
  const user = getCognitoUser(email);
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();
        resolve({ idToken, accessToken });
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: () => reject(new Error("New password required – please use the forgot-password flow")),
    });
  });
}

export function getCurrentUser(): CognitoUser | null {
  return getPool().getCurrentUser();
}

export function getSession(): Promise<{ idToken: string; accessToken: string }> {
  const user = getCurrentUser();
  if (!user) return Promise.reject(new Error("Not signed in"));

  return new Promise((resolve, reject) => {
    user.getSession((err: Error | null, session: unknown) => {
      if (err) {
        reject(err);
        return;
      }
      const s = session as { getIdToken: () => { getJwtToken: () => string }; getAccessToken: () => { getJwtToken: () => string } };
      if (!s?.getIdToken?.()) {
        reject(new Error("No session"));
        return;
      }
      resolve({
        idToken: s.getIdToken().getJwtToken(),
        accessToken: s.getAccessToken().getJwtToken(),
      });
    });
  });
}

export function signOut(): void {
  const user = getCurrentUser();
  if (user) user.signOut();
}
