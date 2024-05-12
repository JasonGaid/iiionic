import React, { useState } from 'react';
import { IonContent, IonInput, IonButton, IonText, IonIcon, IonToast } from '@ionic/react';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import { personAddOutline } from 'ionicons/icons';
import './registerForm.css';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setShowToast(true);
      return;
    }
  
    // Check if email contains 'admin'
    if (email.toLowerCase().includes('admin')) {
      setError('Registration as admin is not allowed');
      setShowToast(true);
      return;
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register', {
        name: name,
        email: email,
        password: password,
      });
      setRegistered(true); // Set registered state to true
      setShowToast(true);
      // Redirect to login page
      history.push('/login');
    } catch (error: any) { // Explicitly type 'error' as 'any'
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while processing your request');
      }
      setShowToast(true);
    }
  };

  return (
    <IonContent className="ion-padding register-background">
      <div className="register-form-container">
        <div className="image-container">
          <img src="https://cdn.dribbble.com/users/1319343/screenshots/14584578/media/a77349bede651cdf43d49ad531180689.gif" alt="Login Image" />
        </div>
        <div className="form-container">
          <h2>Register</h2>
          {registered && (
            <IonText color="success" className="ion-text-center ion-margin-bottom">
              Registration successful!
            </IonText>
          )}
          <form onSubmit={handleSubmit} className="register-form">
            <IonInput
              type="text"
              value={name}
              onIonChange={(e) => setName(e.detail.value!)}
              placeholder="Name"
              className="input-field"
            />
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              placeholder="Email"
              className="input-field"
            />
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              placeholder="Password"
              className="input-field"
            />
            <IonInput
              type="password"
              value={confirmPassword}
              onIonChange={(e) => setConfirmPassword(e.detail.value!)}
              placeholder="Confirm Password"
              className="input-field"
            />
            <IonButton expand="block" type="submit" color="primary" className="register-button">
              <IonIcon icon={personAddOutline} slot="start" />
              Register
            </IonButton>
          </form>
          {error && (
            <IonText color="danger" className="ion-text-center ion-margin-top error-message">
              {error}
            </IonText>
          )}
          <p className="ion-text-center ion-margin-top login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={error || 'Registration Successful'}
        duration={3000}
        color={error ? 'danger' : 'success'}
      />
    </IonContent>
  );
};

export default RegisterForm;
