import { Accordion } from '@moondreamsdev/dreamer-ui/components';
import { PageNavigation } from '@components/PageNavigation';
import { Link } from 'react-router-dom';

export function FAQ() {
  const faqs = [
    {
      question: "What About Government Requests for My Data?",
      answer: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-mono font-bold tracking-wider uppercase text-sm">
              The Reality of Data Requests
            </h4>
            <p className="text-foreground/70 font-mono text-sm leading-relaxed">
              U.S. law enforcement can compel cloud providers to hand over data they control, 
              regardless of where servers are located. If served with a valid warrant, providers 
              must provide what they have in their possession, custody, or control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-mono font-bold tracking-wider uppercase text-xs text-foreground/70">
                What Providers Must Hand Over
              </h4>
              <ul className="space-y-2 font-mono text-xs text-foreground/60">
                <li className="flex items-start gap-2">
                  <span className="text-foreground/40">•</span>
                  <span>All encrypted data in cloud storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/40">•</span>
                  <span>Encrypted metadata and access logs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/40">•</span>
                  <span>User activity logs (IP addresses, login times)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono font-bold tracking-wider uppercase text-xs text-foreground">
                What They Actually Get From Calypso
              </h4>
              <ul className="space-y-2 font-mono text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-foreground">✓</span>
                  <span><strong>Ciphertext</strong> — encrypted, unreadable data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground">✓</span>
                  <span><strong>No decryption keys</strong> — those stay on your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground">✓</span>
                  <span><strong>Useless without your passphrase</strong> — which we never see</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-border bg-background/50 rounded border p-4">
            <p className="text-foreground/70 font-mono text-xs leading-relaxed">
              <strong className="text-foreground">The Bottom Line:</strong> Authorities cannot compel companies to build backdoors 
              or decrypt data they can't access. Your master key is derived on your device and never transmitted. 
              Providers would hand over gibberish — mathematically useless without your passphrase.
            </p>
          </div>
        </div>
      ),
    },
    {
      question: "How is Calypso Different from Regular Cloud Storage?",
      answer: (
        <div className="space-y-3">
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            Regular cloud providers can access your files to provide features like AI search, content scanning, 
            and collaboration tools. While convenient, this means your data is readable by the provider.
          </p>
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            Calypso uses zero-knowledge encryption — all encryption happens on your device before data reaches 
            our servers. We literally cannot read your files, even if we wanted to. This makes us ideal for 
            sensitive documents you'd never want exposed, while regular cloud storage remains perfect for 
            everyday files you want to share or search with AI.
          </p>
        </div>
      ),
    },
    {
      question: "What Happens If I Forget My Passphrase?",
      answer: (
        <div className="space-y-3">
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            Your passphrase is never stored or transmitted — it only exists on your device during your session. 
            This is what makes zero-knowledge encryption secure.
          </p>
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            <strong>If you forget your passphrase</strong>, you can use one of your 10 recovery codes to regain access. 
            Each recovery code can only be used once, so store them securely (password manager, safe, etc.).
          </p>
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            <strong>Without your passphrase or recovery codes</strong>, your data is permanently inaccessible — 
            not even we can recover it. This is the trade-off for true privacy.
          </p>
        </div>
      ),
    },
    {
      question: "Is My Data Really Private?",
      answer: (
        <div className="space-y-3">
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            Yes. All encryption happens on your device using military-grade AES-256-GCM encryption before any 
            data reaches our servers. Your passphrase is used to derive a master key that never leaves your device.
          </p>
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            Each file has its own unique encryption key (DEK), which is itself encrypted with your master key. 
            We store encrypted data, encrypted keys, and access logs — but cannot read any of it without your passphrase.
          </p>
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            Even our developers and system administrators cannot access your decrypted data. 
            This is mathematically enforced, not just a policy.
          </p>
        </div>
      ),
    },
    {
      question: "Can I Use Calypso on Multiple Devices?",
      answer: (
        <div className="space-y-3">
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            Yes! Your encrypted data is stored in the cloud and accessible from any device with an internet 
            connection. Simply sign in with your email and enter your passphrase.
          </p>
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            Your encryption salt is securely stored, so you use the same passphrase across all devices — 
            no need to recreate your vault for each device. The decryption happens locally on whichever 
            device you're using.
          </p>
        </div>
      ),
    },
    {
      question: "What File Types Can I Store?",
      answer: (
        <div className="space-y-3">
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            You can store any file type up to 50MB each: images, videos, documents, PDFs, audio files, 
            and even custom file formats. The vault also supports encrypted text notes.
          </p>
          <p className="text-foreground/70 font-mono text-sm leading-relaxed">
            All file types are encrypted with the same security standards regardless of format. 
            Organize your files in nested folders for easy management.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="page overflow-y-auto">
      <PageNavigation currentPage='faq' />

      <div className="min-h-full py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-wider uppercase">
              Frequently Asked Questions
            </h1>
            <p className="text-foreground/70 font-mono text-sm max-w-2xl mx-auto">
              Common questions about Calypso's zero-knowledge encryption and privacy features.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion
            items={faqs.map((faq) => ({
              title: faq.question,
              content: faq.answer,
            }))}
            className='mb-0'
          />

          {/* Back Links */}
          <div className="text-center space-y-4 pt-8 border-t border-border">
            <p className="text-foreground/70 font-mono text-sm">
              Still have questions?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/why-use"
                className="text-foreground/60 hover:text-foreground font-mono text-xs tracking-wider uppercase underline decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                Why Use Calypso?
              </Link>
              <Link
                to="/login"
                className="text-foreground/60 hover:text-foreground font-mono text-xs tracking-wider uppercase underline decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
