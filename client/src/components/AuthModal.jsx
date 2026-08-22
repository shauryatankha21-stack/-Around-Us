import { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, toast }) {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Any');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName('');
    setCollege('');
    setCity('');
    setDob('');
    setGender('Any');
    setEmail('');
    setPassword('');
  }

  function handleToggle(e) {
    e.preventDefault();
    setIsSignUp((prev) => !prev);
    resetForm();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast('Enter your email and password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      toast('Please enter your name.');
      return;
    }

    if (isSignUp) {
      if (!dob) {
        toast('Please enter your date of birth.');
        return;
      }
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 16) {
        toast('You must be at least 16 years old to join.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (isSignUp) {
        const result = await signUp({ 
          email: email.trim(), 
          password, 
          name: name.trim(), 
          college: college.trim(), 
          city: city.trim(),
          date_of_birth: dob,
          gender
        });
        if (result.error) {
          toast(result.error);
        } else if (result.needsConfirmation) {
          toast('Account created. Check your email to confirm it.');
          onClose();
        } else {
          toast(`Welcome, ${name.trim()}!`);
          onClose();
        }
      } else {
        const result = await signIn({ email: email.trim(), password });
        if (result.error) {
          toast(result.error);
          if (result.error === 'Create an account first.') {
            setIsSignUp(true);
          }
        } else {
          toast('Signed in successfully.');
          onClose();
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="eyebrow">AROUND US ACCOUNT</div>
      <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>

      {isSignUp && (
        <div className="profile-card">
          <div className="profile-avatar">A</div>
          <div>
            <strong>Your name appears here</strong>
            <span>Shown on your profile and hosted games.</span>
          </div>
        </div>
      )}

      <form id="authForm" className="auth-form" onSubmit={handleSubmit}>
        {isSignUp && (
          <>
            <label>
              Name
              <input
                id="authName"
                required
                autoComplete="name"
                placeholder="e.g. Avni"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              College
              <input
                id="authCollege"
                autoComplete="organization"
                placeholder="Your college"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </label>
            <label>
              City
              <input
                id="authCity"
                autoComplete="address-level2"
                placeholder="Your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label>
              Date of Birth
              <input
                id="authDob"
                type="date"
                required
                value={dob}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                onChange={(e) => setDob(e.target.value)}
              />
            </label>
            <label>
              Gender
              <select
                id="authGender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Any">Any / Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </>
        )}

        <label>
          Email
          <input
            id="authEmail"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            id="authPassword"
            type="password"
            minLength="6"
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" className="main" disabled={submitting}>
          {submitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        {isSignUp ? 'Already have an account?' : 'New to Around Us?'}{' '}
        <button type="button" id="authSwitch" className="auth-switch-btn" onClick={handleToggle}>
          {isSignUp ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </Modal>
  );
}
