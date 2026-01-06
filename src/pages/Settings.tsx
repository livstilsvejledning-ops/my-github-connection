import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AvatarUpload } from '@/components/shared/AvatarUpload';
import { User, Bell, Shield, Palette, Save, Loader2, Mail, Phone, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    profile_image_url: null as string | null,
  });
  const [notifications, setNotifications] = useState({
    email: true,
    checkInReminders: true,
    messageNotifications: true,
    atRiskAlerts: true
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        profile_image_url: data.profile_image_url,
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq('id', user?.id);

    if (error) {
      toast.error('Kunne ikke gemme ændringer');
    } else {
      toast.success('Dine ændringer er blevet gemt');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Indstillinger</h1>
          <p className="text-muted-foreground">Administrer din konto og præferencer</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4 rounded-xl bg-muted p-1">
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-card">
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-card">
              <Bell className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Notifikationer</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-card">
              <Shield className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sikkerhed</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-card">
              <Palette className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Udseende</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="rounded-2xl border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profil Information
                </CardTitle>
                <CardDescription>Opdater dine personlige oplysninger</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar with Upload */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  {user && (
                    <AvatarUpload
                      userId={user.id}
                      currentAvatarUrl={profile.profile_image_url}
                      fullName={profile.full_name}
                      onUploadComplete={() => fetchProfile()}
                      size="lg"
                    />
                  )}
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h3 className="font-semibold text-lg">{profile.full_name || 'Dit navn'}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Klik på billedet for at uploade et nyt (max 5MB)
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Fulde navn</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="rounded-xl bg-muted/50 border-transparent focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="rounded-xl bg-muted"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="rounded-xl bg-muted/50 border-transparent focus:border-primary"
                      placeholder="+45 12 34 56 78"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSave} 
                  className="rounded-xl gradient-primary text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Gem ændringer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="rounded-2xl border-border shadow-card">
              <CardHeader>
                <CardTitle>Notifikationsindstillinger</CardTitle>
                <CardDescription>Vælg hvordan du vil modtage notifikationer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                  <div>
                    <p className="font-medium">Email notifikationer</p>
                    <p className="text-sm text-muted-foreground">Modtag emails om nye bookinger</p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                  <div>
                    <p className="font-medium">Check-in påmindelser</p>
                    <p className="text-sm text-muted-foreground">Påmind klienter om at check-in</p>
                  </div>
                  <Switch 
                    checked={notifications.checkInReminders}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, checkInReminders: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                  <div>
                    <p className="font-medium">Besked notifikationer</p>
                    <p className="text-sm text-muted-foreground">Notificer om nye beskeder</p>
                  </div>
                  <Switch 
                    checked={notifications.messageNotifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, messageNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                  <div>
                    <p className="font-medium">At-risk kunde alerts</p>
                    <p className="text-sm text-muted-foreground">Besked når kunder kræver opmærksomhed</p>
                  </div>
                  <Switch 
                    checked={notifications.atRiskAlerts}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, atRiskAlerts: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="rounded-2xl border-border shadow-card">
              <CardHeader>
                <CardTitle>Sikkerhed</CardTitle>
                <CardDescription>Administrer din kontosikkerhed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nuværende adgangskode</Label>
                    <Input type="password" className="rounded-xl max-w-md bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ny adgangskode</Label>
                    <Input type="password" className="rounded-xl max-w-md bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bekræft ny adgangskode</Label>
                    <Input type="password" className="rounded-xl max-w-md bg-muted/50" />
                  </div>
                  <Button className="rounded-xl gradient-primary text-primary-foreground">
                    Opdater adgangskode
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-destructive mb-2">Farezone</h4>
                  <Button 
                    variant="destructive" 
                    onClick={signOut}
                    className="w-full sm:w-auto"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log ud af alle enheder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="rounded-2xl border-border shadow-card">
              <CardHeader>
                <CardTitle>Udseende</CardTitle>
                <CardDescription>Tilpas appens udseende</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                  <div>
                    <p className="font-medium">Mørk tilstand</p>
                    <p className="text-sm text-muted-foreground">Skift til mørkt tema</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}