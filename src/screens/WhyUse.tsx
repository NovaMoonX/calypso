import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import {
  SecurityIllustration,
  SimplicityIllustration,
  ControlIllustration,
  NoLockInIllustration,
} from '@components/WhyUseIllustrations';

interface BenefitCardProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ illustration, title, description }: BenefitCardProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 p-6">
      <div className="flex items-center justify-center">
        {illustration}
      </div>
      <h3 className="font-mono text-xl font-bold tracking-wider uppercase">
        {title}
      </h3>
      <p className="text-foreground/70 font-mono text-sm leading-relaxed max-w-sm">
        {description}
      </p>
    </div>
  );
}

export function WhyUse() {
  return (
    <div className="page overflow-y-auto">
      <div className="min-h-full py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-wider uppercase">
              Why Choose Calypso?
            </h1>
            <p className="text-foreground/70 font-mono text-lg max-w-3xl mx-auto">
              Your data deserves better than traditional cloud storage.
              Here's why Calypso is the superior choice for your sensitive digital materials.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <BenefitCard
              illustration={<SecurityIllustration />}
              title="True Privacy"
              description="Unlike traditional cloud providers, we can't read your data. Everything is encrypted on your device before it reaches our servers. Even if our systems were compromised, your data remains completely secure and private."
            />

            <BenefitCard
              illustration={<SimplicityIllustration />}
              title="Surprisingly Simple"
              description="No complex setup or technical knowledge required. Just sign in with your email, create a passphrase, and you're protected. Our clean, monochrome interface keeps things focused on what matters: your data."
            />

            <BenefitCard
              illustration={<ControlIllustration />}
              title="You're In Control"
              description="Your passphrase is the only key to your data. You decide what to store, who can access it (only you), and when to delete it. No third parties, no backdoors, no exceptions."
            />

            <BenefitCard
              illustration={<NoLockInIllustration />}
              title="No Vendor Lock-In"
              description="Your encrypted data is yours. Store notes, images, videos, and files up to 50MB each. Download them anytime. Leave whenever you want. We believe in your right to data ownership and portability."
            />
          </div>

          {/* Comparison Section */}
          <div className="border-border bg-card rounded-lg border p-8 space-y-6">
            <h2 className="font-mono text-2xl font-bold tracking-wider uppercase text-center">
              How We're Different
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Traditional Cloud */}
              <div className="space-y-3">
                <h3 className="font-mono font-bold tracking-wider uppercase text-foreground/50">
                  Traditional Cloud Storage
                </h3>
                <ul className="space-y-2 font-mono text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/40 mt-1">•</span>
                    <span>Provider can access your files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/40 mt-1">•</span>
                    <span>Subject to data mining and ads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/40 mt-1">•</span>
                    <span>Government requests for your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/40 mt-1">•</span>
                    <span>Complex privacy policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/40 mt-1">•</span>
                    <span>Lock-in to their ecosystem</span>
                  </li>
                </ul>
              </div>

              {/* Calypso */}
              <div className="space-y-3">
                <h3 className="font-mono font-bold tracking-wider uppercase">
                  Calypso (Zero-Knowledge)
                </h3>
                <ul className="space-y-2 font-mono text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground mt-1">✓</span>
                    <span>Only you can decrypt your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground mt-1">✓</span>
                    <span>No data mining - we can't see it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground mt-1">✓</span>
                    <span>Nothing to hand over to anyone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground mt-1">✓</span>
                    <span>Simple: what you see is what you get</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground mt-1">✓</span>
                    <span>Your data is portable and yours</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="space-y-8">
            <h2 className="font-mono text-2xl font-bold tracking-wider uppercase text-center">
              Perfect For
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={join(
                'border-border bg-card rounded-lg border p-6 space-y-2',
                'hover:border-foreground/30 transition-colors'
              )}>
                <h3 className="font-mono font-bold tracking-wider uppercase text-sm">
                  Personal Documents
                </h3>
                <p className="text-foreground/70 font-mono text-xs leading-relaxed">
                  Store passwords, private keys, medical records, legal documents, and other sensitive information you don't want on corporate servers.
                </p>
              </div>

              <div className={join(
                'border-border bg-card rounded-lg border p-6 space-y-2',
                'hover:border-foreground/30 transition-colors'
              )}>
                <h3 className="font-mono font-bold tracking-wider uppercase text-sm">
                  Creative Work
                </h3>
                <p className="text-foreground/70 font-mono text-xs leading-relaxed">
                  Keep your unpublished writings, photos, videos, and creative projects private until you're ready to share them on your terms.
                </p>
              </div>

              <div className={join(
                'border-border bg-card rounded-lg border p-6 space-y-2',
                'hover:border-foreground/30 transition-colors'
              )}>
                <h3 className="font-mono font-bold tracking-wider uppercase text-sm">
                  Family Memories
                </h3>
                <p className="text-foreground/70 font-mono text-xs leading-relaxed">
                  Archive personal photos and videos without worrying about them being scanned, analyzed, or used for AI training by tech companies.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6 py-8">
            <p className="text-foreground/70 font-mono text-sm max-w-2xl mx-auto">
              Ready to take control of your digital privacy?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                href="/login"
                variant="primary"
                className="font-mono tracking-wider min-w-[200px]"
              >
                GET STARTED
              </Button>
              <Button
                href="/about"
                variant="secondary"
                className="font-mono tracking-wider min-w-[200px]"
              >
                LEARN MORE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhyUse;
