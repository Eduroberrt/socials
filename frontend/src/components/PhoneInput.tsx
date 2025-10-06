import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

// Common countries with their dial codes and flags
const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your phone number",
  className = "",
  required = false
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'NG') || countries[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');

  // Try to detect user's country based on timezone or other methods
  useEffect(() => {
    const detectCountry = () => {
      try {
        // Try to detect from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Default to Nigeria, but check for specific timezones if needed
        let detectedCountry = countries.find(c => c.code === 'NG'); // Default to Nigeria
        
        // Only override if we detect specific other regions
        if (timezone.includes('America/New_York') || timezone.includes('America/Chicago') || 
            timezone.includes('America/Denver') || timezone.includes('America/Los_Angeles')) {
          detectedCountry = countries.find(c => c.code === 'US');
        } else if (timezone.includes('Europe/London')) {
          detectedCountry = countries.find(c => c.code === 'GB');
        } else if (timezone.includes('Europe/Berlin')) {
          detectedCountry = countries.find(c => c.code === 'DE');
        } else if (timezone.includes('Europe/Paris')) {
          detectedCountry = countries.find(c => c.code === 'FR');
        } else if (timezone.includes('Asia/Tokyo')) {
          detectedCountry = countries.find(c => c.code === 'JP');
        } else if (timezone.includes('Asia/Shanghai')) {
          detectedCountry = countries.find(c => c.code === 'CN');
        } else if (timezone.includes('Asia/Kolkata')) {
          detectedCountry = countries.find(c => c.code === 'IN');
        } else if (timezone.includes('Africa/Lagos')) {
          detectedCountry = countries.find(c => c.code === 'NG'); // Nigeria timezone
        }
        
        setSelectedCountry(detectedCountry || countries.find(c => c.code === 'NG') || countries[0]);
      } catch (error) {
        console.log('Could not detect country, using Nigeria as default');
        setSelectedCountry(countries.find(c => c.code === 'NG') || countries[0]);
      }
    };

    detectCountry();
  }, []);

  const handlePhoneChange = (newValue: string) => {
    // Remove any non-numeric characters except spaces, dashes, and parentheses
    const cleaned = newValue.replace(/[^\d\s\-()]/g, '');
    setPhoneNumber(cleaned);
    
    // Combine country code with phone number
    const fullNumber = selectedCountry.dialCode + ' ' + cleaned;
    onChange(fullNumber);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      // Update the full number with new country code
      const fullNumber = country.dialCode + ' ' + phoneNumber;
      onChange(fullNumber);
    }
  };

  return (
    <div className="flex">
      {/* Country Selector */}
      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[120px] bg-saas-darkGray border-gray-600 text-white border-r-0 rounded-r-none focus:border-saas-orange">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.dialCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-saas-darkGray border-gray-600">
          {countries.map((country) => (
            <SelectItem 
              key={country.code} 
              value={country.code}
              className="text-white hover:bg-saas-black focus:bg-saas-black"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm">{country.dialCode}</span>
                <span className="text-sm">{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Phone Number Input */}
      <Input
        type="tel"
        value={phoneNumber}
        onChange={(e) => handlePhoneChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange rounded-l-none border-l-0 ${className}`}
        required={required}
      />
    </div>
  );
};

export default PhoneInput;