/**
 * Admin Login Page
 * Handles admin login with 2FA support
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [showTwoFA, setShowTwoFA] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login, verify2FA } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await login({ email, password });

            if (response.requires_2fa) {
                setTempToken(response.temp_token || '');
                setShowTwoFA(true);
                toast.info('Please enter your 2FA code');
            } else {
                navigate('/admin');
            }
        } catch (error) {
            // Error is handled in context
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FAVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await verify2FA({ temp_token: tempToken, code: twoFACode });
            navigate('/admin');
        } catch (error) {
            // Error is handled in context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Admin Panel</CardTitle>
                    <CardDescription className="text-base">
                        {showTwoFA ? 'Enter your 2FA code' : 'Sign in to manage your platform'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showTwoFA ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@cruzaa.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>

                        </form>
                    ) : (
                        <form onSubmit={handle2FAVerification} className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800 text-center">
                                    <Shield className="inline-block w-4 h-4 mr-1" />
                                    Open your authenticator app and enter the 6-digit code
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twofa">2FA Code</Label>
                                <Input
                                    id="twofa"
                                    type="text"
                                    placeholder="000000"
                                    value={twoFACode}
                                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-center text-2xl tracking-widest"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setShowTwoFA(false);
                                        setTwoFACode('');
                                        setTempToken('');
                                    }}
                                >
                                    Back
                                </Button>
                                <Button type="submit" className="w-full" disabled={isLoading || twoFACode.length !== 6}>
                                    {isLoading ? 'Verifying...' : 'Verify'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
