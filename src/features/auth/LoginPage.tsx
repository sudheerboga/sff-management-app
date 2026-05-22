import { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { ConfirmationResult } from 'firebase/auth';
import { sendPhoneOtp, signInAdmin } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const [tab, setTab] = useState(0);
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  if (user) {
    if (user.role === 'superAdmin') navigate('/admin', { replace: true });
    else navigate('/dashboard', { replace: true });
  }

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) { setError('Enter a valid phone number'); return; }
    setLoading(true);
    setError('');
    try {
      confirmationRef.current = await sendPhoneOtp(phone.startsWith('+') ? phone : `+91${phone}`, 'recaptcha-container');
      setStep('otp');
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) { setError('Enter the OTP'); return; }
    setLoading(true);
    setError('');
    try {
      await confirmationRef.current!.confirm(otp);
      // navigation handled by auth state listener once role is resolved
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!email || !password) { setError('Enter email and password'); return; }
    setLoading(true);
    setError('');
    try {
      await signInAdmin(email, password);
      navigate('/admin', { replace: true });
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg,#1a0f35 0%,#3d2070 50%,#7B5EA7 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', background: 'rgba(201,107,154,.15)', filter: 'blur(50px)' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,111,212,.12)', filter: 'blur(40px)' }} />

      <div id="recaptcha-container" />

      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,.35)', overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg,#4A6FD4 0%,#7B5EA7 40%,#C96B9A 100%)',
            py: 3.5,
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box sx={{ width: 56, height: 56, borderRadius: 2.5, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StorefrontIcon sx={{ color: '#fff', fontSize: 30 }} />
          </Box>
          <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#fff', textAlign: 'center' }}>
            Boutique Ecosystem
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.75)', textAlign: 'center' }}>
            Sign in to your account
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); setStep('phone'); setOtp(''); }} sx={{ mb: 3 }} variant="fullWidth">
            <Tab label="Boutique Login" sx={{ fontSize: 13, fontWeight: 600 }} />
            <Tab label="Admin Login" sx={{ fontSize: 13, fontWeight: 600 }} />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>{error}</Alert>}

          {tab === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {step === 'phone' ? (
                <>
                  <TextField
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color="action" /></InputAdornment> }}
                    placeholder="+91 98765 43210"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  />
                  <Button variant="contained" fullWidth onClick={handleSendOtp} disabled={loading} size="large">
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Send OTP'}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    OTP sent to <strong>{phone}</strong>
                  </Typography>
                  <TextField
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    fullWidth
                    inputProps={{ maxLength: 6, style: { letterSpacing: '0.3em', fontSize: 22, textAlign: 'center' } }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  />
                  <Button variant="contained" fullWidth onClick={handleVerifyOtp} disabled={loading} size="large">
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Verify OTP'}
                  </Button>
                  <Button variant="text" size="small" onClick={() => { setStep('phone'); setOtp(''); }} disabled={loading}>
                    Change number
                  </Button>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment> }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment> }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <Button variant="contained" fullWidth onClick={handleAdminLogin} disabled={loading} size="large">
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
