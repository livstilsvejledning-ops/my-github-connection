import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, Palette, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
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
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Kunne ikke gemme ændringer',
      });
    } else {
      toast({
        title: 'Gemt!',
        description: 'Dine ændringer er blevet gemt',
      });
    }
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
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
                <CardTitle>Profil Information</CardTitle>
                <CardDescription>Opdater dine personlige oplysninger</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(profile.full_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="rounded-xl">
                      Skift billede
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG eller GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Fulde navn</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="rounded-xl bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="rounded-xl"
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
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                    <div>
                      <p className="font-medium">Email notifikationer</p>
                      <p className="text-sm text-muted-foreground">Modtag emails om nye bookinger</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                    <div>
                      <p className="font-medium">Check-in påmindelser</p>
                      <p className="text-sm text-muted-foreground">Påmind klienter om at check-in</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                    <div>
                      <p className="font-medium">Besked notifikationer</p>
                      <p className="text-sm text-muted-foreground">Notificer om nye beskeder</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
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
                    <Input type="password" className="rounded-xl max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ny adgangskode</Label>
                    <Input type="password" className="rounded-xl max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bekræft ny adgangskode</Label>
                    <Input type="password" className="rounded-xl max-w-md" />
                  </div>
                  <Button className="rounded-xl gradient-primary text-primary-foreground">
                    Opdater adgangskode
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
