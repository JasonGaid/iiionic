import React, { useState } from 'react';
import { IonContent, IonInput, IonButton, IonText, IonIcon, IonToast } from '@ionic/react';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import { personOutline } from 'ionicons/icons';
import './loginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if email contains 'admin'
    if (email.toLowerCase().includes('admin')) {
      setError('Logging in as admin is not allowed');
      setShowToast(true);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email,
        password,
      });

      setError(null);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      history.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      setShowToast(true);
    }
  };

  return (
    <IonContent className="ion-padding">
      <div className="login-background">
        <div className="login-form-container">
          <div className="image-container">
            <img src="https://cdn.dribbble.com/users/1319343/screenshots/14584578/media/0f03b736aece839041bb4370290355fd.gif" alt="Login Image" />
          </div>
          <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <IonInput
                type="email"
                value={email}
                placeholder="Email"
                onIonChange={(e) => setEmail(e.detail.value!)}
                required
                className="input-field"
              />
              <IonInput
                type="password"
                value={password}
                placeholder="Password"
                onIonChange={(e) => setPassword(e.detail.value!)}
                required
                className="input-field"
              />
              <IonButton expand="block" type="submit" color="primary" className="login-button">
                <IonIcon icon={personOutline} slot="start" />
                Login
              </IonButton>
            </form>
            {error && (
              <IonText color="danger" className="error-message">
                {error}
              </IonText>
            )}
            <IonToast
              isOpen={showToast}
              onDidDismiss={() => setShowToast(false)}
              message={error || 'Login Successful'}
              duration={3000}
              color={error ? 'danger' : 'success'}
            />
            <p className="register-link ion-text-center">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </IonContent>
  );
};

export default LoginForm;
