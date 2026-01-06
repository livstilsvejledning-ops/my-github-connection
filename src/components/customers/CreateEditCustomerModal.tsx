import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, ChevronLeft, ChevronRight, Check, User, Target, CreditCard, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateEditCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CustomerFormData) => Promise<void>;
  initialData?: Partial<CustomerFormData>;
  isEditing?: boolean;
}

export interface CustomerFormData {
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other' | '';
  height_cm: string;
  weight_kg: string;
  weight_goal_kg: string;
  activity_level: string;
  subscription_type: string;
  subscription_start_date: string;
  subscription_end_date: string;
  status: string;
  notes: string;
  tags: string[];
}

const initialFormData: CustomerFormData = {
  full_name: '',
  email: '',
  phone: '',
  birth_date: '',
  gender: '',
  height_cm: '',
  weight_kg: '',
  weight_goal_kg: '',
  activity_level: '',
  subscription_type: '',
  subscription_start_date: '',
  subscription_end_date: '',
  status: 'active',
  notes: '',
  tags: [],
};

const steps = [
  { id: 1, title: 'Basis Info', icon: User },
  { id: 2, title: 'Målsætning', icon: Target },
  { id: 3, title: 'Subscription', icon: CreditCard },
  { id: 4, title: 'Noter & Tags', icon: FileText },
];

export function CreateEditCustomerModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  isEditing = false,
}: CreateEditCustomerModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CustomerFormData>({ ...initialFormData, ...initialData });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof CustomerFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateField('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      setFormData(initialFormData);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
    setFormData({ ...initialFormData, ...initialData });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 rounded-2xl overflow-hidden border-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 gradient-primary">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              {isEditing ? 'Rediger Kunde' : 'Opret Ny Kunde'}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                    currentStep >= step.id 
                      ? "bg-white text-primary" 
                      : "bg-white/20 text-white/60"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-1",
                    currentStep > step.id ? "bg-white" : "bg-white/20"
                  )} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-white/80 text-sm mt-2">
            {steps[currentStep - 1].title}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 bg-card max-h-[60vh] overflow-y-auto">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Fuldt navn <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="Kundens fulde navn"
                  className="rounded-xl bg-input border-border focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="kunde@email.dk"
                  className="rounded-xl bg-input border-border focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+45 12 34 56 78"
                  className="rounded-xl bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date" className="text-sm font-medium">Fødselsdato</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => updateField('birth_date', e.target.value)}
                  className="rounded-xl bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Køn</Label>
                <RadioGroup 
                  value={formData.gender}
                  onValueChange={(value) => updateField('gender', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" className="border-primary text-primary" />
                    <Label htmlFor="male" className="cursor-pointer">Mand</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" className="border-primary text-primary" />
                    <Label htmlFor="female" className="cursor-pointer">Kvinde</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" className="border-primary text-primary" />
                    <Label htmlFor="other" className="cursor-pointer">Andet</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="height_cm" className="text-sm font-medium">Højde (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={formData.height_cm}
                  onChange={(e) => updateField('height_cm', e.target.value)}
                  placeholder="175"
                  className="rounded-xl bg-input border-border focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight_kg" className="text-sm font-medium">Nuværende vægt (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={(e) => updateField('weight_kg', e.target.value)}
                    placeholder="80.0"
                    className="rounded-xl bg-input border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight_goal_kg" className="text-sm font-medium">Målvægt (kg)</Label>
                  <Input
                    id="weight_goal_kg"
                    type="number"
                    step="0.1"
                    value={formData.weight_goal_kg}
                    onChange={(e) => updateField('weight_goal_kg', e.target.value)}
                    placeholder="75.0"
                    className="rounded-xl bg-input border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Aktivitetsniveau</Label>
                <Select 
                  value={formData.activity_level}
                  onValueChange={(value) => updateField('activity_level', value)}
                >
                  <SelectTrigger className="rounded-xl bg-input border-border focus:border-primary">
                    <SelectValue placeholder="Vælg aktivitetsniveau" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="sedentary">Stillesiddende</SelectItem>
                    <SelectItem value="light">Let aktiv</SelectItem>
                    <SelectItem value="moderate">Moderat aktiv</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="very_active">Meget aktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Subscription */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Abonnementstype</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Basic', 'Premium', 'VIP'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField('subscription_type', type.toLowerCase())}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        formData.subscription_type === type.toLowerCase()
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-semibold text-foreground">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription_start_date" className="text-sm font-medium">Start dato</Label>
                  <Input
                    id="subscription_start_date"
                    type="date"
                    value={formData.subscription_start_date}
                    onChange={(e) => updateField('subscription_start_date', e.target.value)}
                    className="rounded-xl bg-input border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscription_end_date" className="text-sm font-medium">Slut dato</Label>
                  <Input
                    id="subscription_end_date"
                    type="date"
                    value={formData.subscription_end_date}
                    onChange={(e) => updateField('subscription_end_date', e.target.value)}
                    className="rounded-xl bg-input border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => updateField('status', value)}
                >
                  <SelectTrigger className="rounded-xl bg-input border-border focus:border-primary">
                    <SelectValue placeholder="Vælg status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                    <SelectItem value="on_hold">På pause</SelectItem>
                    <SelectItem value="completed">Afsluttet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Notes & Tags */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Noter</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Tilføj noter om kunden..."
                  className="rounded-xl bg-input border-border focus:border-primary min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Tilføj tag..."
                    className="rounded-xl bg-input border-border focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button 
                    type="button" 
                    onClick={addTag}
                    className="rounded-xl gradient-primary text-white px-4"
                  >
                    Tilføj
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border bg-card flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="rounded-xl"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Forrige
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="rounded-xl gradient-primary text-white"
            >
              Næste
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isLoading || !formData.full_name || !formData.email}
              className="rounded-xl gradient-primary text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gemmer...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Gem Kunde
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
