import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import {
  SecurityIllustration,
  SimplicityIllustration,
  ControlIllustration,
  NoLockInIllustration,
  PersonalDocumentsIllustration,
  CreativeWorkIllustration,
  FamilyMemoriesIllustration,
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

interface UseCaseCardProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
}

function UseCaseCard({ illustration, title, description, examples }: UseCaseCardProps) {
  return (
    <div className={join(
      'border-border bg-card rounded-lg border p-6 space-y-4',
      'hover:border-foreground/30 transition-colors'
    )}>
      <div className="flex justify-center">
        {illustration}
      </div>
      <h3 className="font-mono font-bold tracking-wider uppercase text-sm">
        {title}
      </h3>
      <p className="text-foreground/70 font-mono text-xs leading-relaxed">
        {description}
      </p>
      <div className="space-y-1.5">
        <p className="text-foreground/50 font-mono text-xs uppercase tracking-wider">Examples:</p>
        <ul className="space-y-1 font-mono text-xs text-foreground/60">
          {examples.map((example, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-foreground/40">•</span>
              <span>{example}</span>
            </li>
          ))}
        </ul>
      </div>
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
              Why Use Calypso?
            </h1>
            <p className="text-foreground/70 font-mono text-lg max-w-3xl mx-auto">
              We're not asking you to replace Google Drive or iCloud. 
              We're here for the things you'd never want to store there.
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
              Why Not Just Use Google Drive?
            </h2>
            
            <p className="text-foreground/70 font-mono text-sm text-center max-w-2xl mx-auto">
              Traditional cloud providers offer amazing features like AI-powered search, collaboration tools, and seamless integration. 
              They're perfect for everyday files. But for your most sensitive data, the trade-off is privacy.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Traditional Cloud */}
              <div className="space-y-3">
                <h3 className="font-mono font-bold tracking-wider uppercase text-foreground/70">
                  Traditional Cloud Storage
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-mono text-xs font-bold tracking-wider uppercase text-foreground/50 mb-2">Great For:</p>
                    <ul className="space-y-1.5 font-mono text-sm text-foreground/50">
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/30 ">•</span>
                        <span>Sharing files with others</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/30 ">•</span>
                        <span>AI-powered features (search, OCR)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/30 ">•</span>
                        <span>Cross-device sync and convenience</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold tracking-wider uppercase text-foreground/50 mb-2">Privacy Trade-offs:</p>
                    <ul className="space-y-1.5 font-mono text-sm text-foreground/60">
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 ">•</span>
                        <span>Provider can access your files</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 ">•</span>
                        <span>Data may be scanned for ads/AI training</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 ">•</span>
                        <span>Subject to government data requests</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Calypso */}
              <div className="space-y-3">
                <h3 className="font-mono font-bold tracking-wider uppercase">
                  Calypso (Zero-Knowledge Vault)
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-mono text-xs font-bold tracking-wider uppercase text-foreground/50 mb-2">Specialized For:</p>
                    <ul className="space-y-1.5 font-mono text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-foreground ">✓</span>
                        <span>Your most sensitive documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground ">✓</span>
                        <span>Items you'd never want exposed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground ">✓</span>
                        <span>Data requiring complete privacy</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold tracking-wider uppercase text-foreground/50 mb-2">Privacy Guarantees:</p>
                    <ul className="space-y-1.5 font-mono text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-foreground ">✓</span>
                        <span>Only you can decrypt your data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground ">✓</span>
                        <span>We literally can't see your files</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground ">✓</span>
                        <span>Even we can't hand over readable data</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="space-y-8">
            <h2 className="font-mono text-2xl font-bold tracking-wider uppercase text-center">
              What Should You Store Here?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UseCaseCard
                illustration={<PersonalDocumentsIllustration />}
                title="Sensitive Documents"
                description="Items you'd never want exposed in a data breach or scanned by AI."
                examples={[
                  "Social Security card scans",
                  "Passport copies",
                  "Recovery codes for accounts",
                  "Crypto wallet seed phrases",
                  "Medical records & test results",
                  "Tax returns & financial docs",
                  "Legal contracts & wills"
                ]}
              />

              <UseCaseCard
                illustration={<CreativeWorkIllustration />}
                title="Private Creative Work"
                description="Your unpublished work that you want to keep completely private."
                examples={[
                  "Unpublished manuscripts",
                  "Private journal entries",
                  "Original photography",
                  "Unannounced projects",
                  "Personal art & designs",
                  "Music compositions",
                  "Business ideas & plans"
                ]}
              />

              <UseCaseCard
                illustration={<FamilyMemoriesIllustration />}
                title="Personal Memories"
                description="Precious moments you don't want analyzed, tagged, or used for AI training."
                examples={[
                  "Private family photos",
                  "Home videos of children",
                  "Personal voice recordings",
                  "Intimate celebrations",
                  "Private correspondence",
                  "Memorial tributes",
                  "Personal milestones"
                ]}
              />
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
                href="/faq"
                variant="secondary"
                className="font-mono tracking-wider min-w-[200px]"
              >
                VIEW FAQ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhyUse;
