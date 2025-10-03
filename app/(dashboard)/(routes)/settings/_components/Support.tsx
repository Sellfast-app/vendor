"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus } from "lucide-react";
import LinkIcon from "@/components/svgIcons/LinkIcon";
import { Button } from "@/components/ui/button";
import ChatIcon from "@/components/svgIcons/ChatIcon";
import Tutorialcon from "@/components/svgIcons/Tutorialcon";
import CommunityIcon from "@/components/svgIcons/CommunityIcon";
import Emailcon from "@/components/svgIcons/Emailcon";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
}

function SupportComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: "1",
      question: "How to withdraw?",
      answer: "To withdraw funds, navigate to the Payouts section, select your linked bank account, enter the amount you wish to withdraw, and click the 'Withdraw' button. Withdrawals typically process within 1-3 business days.",
      isOpen: false,
    },
    {
      id: "2",
      question: "How do I add my bank account?",
      answer: "Go to Settings > Finance > Bank Account Setup and click 'Add Bank Account'. Enter your bank details including account number, bank name, and account holder name. Verify the information and save.",
      isOpen: false,
    },
    {
      id: "3",
      question: "How do I change the status of my order?",
      answer: "In the Orders section, click on the order you want to update. You'll see status options like 'Processing', 'Shipped', 'Delivered', or 'Cancelled'. Select the new status and save your changes.",
      isOpen: false,
    },
    {
      id: "4",
      question: "What is Ready Stock vs Made-to-order?",
      answer: "Ready Stock items are products you have in inventory and can ship immediately. Made-to-order items are created after a customer places an order, which may have longer fulfillment times.",
      isOpen: false,
    },
  ]);

  const toggleFAQ = (id: string) => {
    setFaqs((prev) =>
      prev.map((faq) =>
        faq.id === id ? { ...faq, isOpen: !faq.isOpen } : faq
      )
    );
  };

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 mt-4">
      {/* FAQs Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6 ">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">FAQs</h2>
              <div className="relative max-w-[240px] w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder='e.g., "How to withdraw"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 dark:bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <span className="text-sm font-medium text-left">
                      {faq.question}
                    </span>
                    {faq.isOpen ? (
                      <Minus className="w-5 h-5 flex-shrink-0 ml-4" />
                    ) : (
                      <Plus className="w-5 h-5 flex-shrink-0 ml-4" />
                    )}
                  </button>
                  {faq.isOpen && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No FAQs found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Support Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="flex items-center justify-between py-6">
              <span className="text-sm font-medium">Chat Support</span>
            <Button variant={"outline"}>
              <ChatIcon/>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <h2 className="text-sm font-medium">Resources</h2>

            <div className="space-y-3">
              {/* Tutorials */}
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Tutorialcon />
                  <span className="text-sm font-medium">Tutorials</span>
                </div>
              <LinkIcon className="text-green-500 hover:text-green-600"/>
              </button>

              {/* Community Forums */}
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <CommunityIcon />
                  <span className="text-sm font-medium">Community Forums</span>
                </div>
                <LinkIcon className="text-green-500 hover:text-green-600"/>
                </button>

              {/* Contact Email */}
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Emailcon />
                  <span className="text-sm font-medium">Contact Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">support@swiftree.app</span>
                  <LinkIcon className="text-green-500 hover:text-green-600"/>
                  </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SupportComponent;