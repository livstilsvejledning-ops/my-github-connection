import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Ruler, Target, LogOut, Bell } from 'lucide-react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_goal_kg: number | null;
  activity_level: string | null;
}

export default function ClientSettings() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reminders: true
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        birth_date: data.birth_date,
        height_cm: data.height_cm,
        weight_goal_kg: data.weight_goal_kg,
        activity_level: data.activity_level
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          birth_date: profile.birth_date,
          height_cm: profile.height_cm,
          weight_goal_kg: profile.weight_goal_kg,
          activity_level: profile.activity_level
        })
        .eq('id', user.id);

      toast.success('Profil opdateret!');
    } catch {
      toast.error('Kunne ikke opdatere profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Indstillinger</h1>

        {/* Profile Info */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Profil Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs"
                >
                  Skift
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fuldt navn</Label>
              <Input
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                className="bg-muted/50 border-transparent focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                value={profile?.email || ''}
                disabled
                className="bg-muted/50 border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Telefon
              </Label>
              <Input
                value={profile?.phone || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                className="bg-muted/50 border-transparent focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Fødselsdato
                </Label>
                <Input
                  type="date"
                  value={profile?.birth_date || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, birth_date: e.target.value } : null)}
                  className="bg-muted/50 border-transparent focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  Højde (cm)
                </Label>
                <Input
                  type="number"
                  value={profile?.height_cm || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, height_cm: parseInt(e.target.value) || null } : null)}
                  className="bg-muted/50 border-transparent focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Målvægt (kg)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={profile?.weight_goal_kg || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, weight_goal_kg: parseFloat(e.target.value) || null } : null)}
                className="bg-muted/50 border-transparent focus:border-primary"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="w-full gradient-primary text-white"
            >
              {isLoading ? 'Gemmer...' : 'Gem Profil'}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Notifikationer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email notifikationer</p>
                <p className="text-sm text-muted-foreground">Modtag beskeder på email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Push notifikationer</p>
                <p className="text-sm text-muted-foreground">Modtag notifikationer i browseren</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Daglige påmindelser</p>
                <p className="text-sm text-muted-foreground">Bliv mindet om check-ins og måltider</p>
              </div>
              <Switch
                checked={notifications.reminders}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reminders: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="rounded-2xl shadow-card border-destructive/20">
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log ud
            </Button>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
