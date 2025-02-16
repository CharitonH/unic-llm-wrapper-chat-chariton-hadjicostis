"use client";

import { useEffect, useState } from "react";
import { Sun, SunMedium, Moon } from "lucide-react";

const Greeting: React.FC = () => {
  const [greeting, setGreeting] = useState("");
  const [icon, setIcon] = useState<React.ReactNode>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning!");
      setIcon(<Sun size={20} className="text-yellow-400" />);
    } else if (hour >= 12 && hour < 15) {
      setGreeting("Good Day!");
      setIcon(<SunMedium size={20} className="text-orange-400" />);
    } else if (hour >= 15 && hour < 18) {
      setGreeting("Good Afternoon!");
      setIcon(<SunMedium size={20} className="text-orange-400" />);
    } else if (hour >= 18 && hour < 24) {
      setGreeting("Good Evening!");
      setIcon(<Moon size={20} className="text-gray-300" />);
    } else {
      setGreeting("Hey, still up!");
      setIcon(<Moon size={20} className="text-blue-400" />);
    }
  }, []);

  return (
    <h2 className="text-md text-gray-300 flex items-center gap-2">
      {icon} {greeting} What can I help with?
    </h2>
  );
};

export default Greeting;
