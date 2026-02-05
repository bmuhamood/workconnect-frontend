// components/ContactModal.tsx
'use client';

import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  User, Phone, Mail, Clock, Shield, Star,
  Send, X, CheckCircle,
  MessageSquare
} from 'lucide-react';

// Create a minimal interface for ContactModal
interface ContactWorker {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profession?: string;
  verification_status?: string;
  rating_average?: string;
  city?: string;
  experience_years?: number;
}

interface ContactModalProps {
  worker: ContactWorker;
  onClose: () => void;
}

export default function ContactModal({ worker, onClose }: ContactModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Message sent to worker:', worker.id, message);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact {worker.full_name}
          </DialogTitle>
          <DialogDescription>
            Send a message to discuss opportunities
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {worker.first_name[0]}{worker.last_name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{worker.full_name}</h3>
            <p className="text-sm text-gray-600">
              {worker.profession || 'Professional Worker'}
              {worker.city && ` • ${worker.city}`}
              {worker.experience_years && ` • ${worker.experience_years} yrs exp`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm interested in discussing a potential opportunity with you..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}