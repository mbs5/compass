"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const EXAMPLE_TOPICS = [
  {
    topic: "Diabetes Management",
    audience: "Hawaiian Community",
    considerations: "Traditional diet, family-centered care approach, local food options"
  },
  {
    topic: "Heart Health",
    audience: "Pacific Islander Community",
    considerations: "Traditional lifestyle, community-based support, local practices"
  }
];

function FormattedContent({ content }: { content: string }) {
  if (!content) return null;

  // Split content into sections based on headings
  const sections = content.split('\n').reduce((acc: { title: string; content: string[] }[], line) => {
    if (line.startsWith('- ')) {
      // Remove the bullet point and trim
      const title = line.slice(2).trim();
      acc.push({ title, content: [] });
    } else if (line.trim() && acc.length > 0) {
      acc[acc.length - 1].content.push(line.trim());
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-lg font-semibold text-primary">
            {section.title}
          </h3>
          <div className="space-y-2 pl-4">
            {section.content.map((paragraph, pIndex) => {
              // Check if the paragraph is a bullet point
              if (paragraph.startsWith('•') || paragraph.startsWith('*')) {
                return (
                  <li key={pIndex} className="ml-4 text-sm text-muted-foreground">
                    {paragraph.slice(1).trim()}
                  </li>
                );
              }
              return (
                <p key={pIndex} className="text-sm text-muted-foreground">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DataContextSection({ context }: { context?: DataContext }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!context) return null;

  return (
    <div className="mt-4 text-xs border-t pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Database size={12} />
        <span>Data References</span>
        <ChevronDown
          size={12}
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-2 bg-muted/50 rounded text-muted-foreground">
              <div className="mb-2">
                <span className="font-medium">Total Population: </span>
                {context.data.totalPopulation.toLocaleString()}
              </div>
              <div className="mb-2">
                <span className="font-medium">Demographics:</span>
                <ul className="list-disc list-inside mt-1">
                  {context.data.demographics.map((item, index) => (
                    <li key={index}>
                      {item.race_group}: {item.total.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-medium">Geographic Distribution:</span>
                <ul className="list-disc list-inside mt-1">
                  {context.data.stateDistribution.map((item, index) => (
                    <li key={index}>
                      {item.state}: {item.total.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-medium">Related Conditions:</span>
                <ul className="list-disc list-inside mt-1">
                  {context.data.relatedConditions.map((item, index) => (
                    <li key={index}>
                      {item.condition}: {item.total.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(context.timestamp).toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DataContext {
  queriesExecuted: string[];
  data: {
    demographics: any[];
    stateDistribution: any[];
    relatedConditions: any[];
    totalPopulation: number;
  };
  timestamp: string;
}

export default function EducationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [dataContext, setDataContext] = useState<DataContext | undefined>(undefined);
  const [formData, setFormData] = useState({
    topic: "",
    targetAudience: "",
    culturalConsiderations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedContent(data.content);
        setDataContext(data.dataContext);
      } else {
        setError(data.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleExampleClick = (example: typeof EXAMPLE_TOPICS[0]) => {
    setFormData({
      topic: example.topic,
      targetAudience: example.audience,
      culturalConsiderations: example.considerations,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Patient Education</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Topic
                </label>
                <input
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g., Diabetes Management"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Target Audience
                </label>
                <input
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g., Hawaiian Community"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Cultural Considerations
                </label>
                <textarea
                  name="culturalConsiderations"
                  value={formData.culturalConsiderations}
                  onChange={handleInputChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any specific cultural elements to include..."
                  required
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
              <button
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </button>
            </form>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 border-t-4 border-t-primary/50">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-muted/30 p-6">
              <div className="prose prose-sm max-w-none">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : generatedContent ? (
                  <>
                    <FormattedContent content={generatedContent} />
                    <DataContextSection context={dataContext} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Generated content will appear here...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-t-4 border-t-primary/30">
          <CardHeader>
            <CardTitle>Example Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {EXAMPLE_TOPICS.map((example, index) => (
                <div 
                  key={index} 
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {example.topic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {example.audience}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExampleClick(example)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-primary hover:text-primary-foreground h-8 w-8"
                    disabled={isLoading}
                  >
                    ↗
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 