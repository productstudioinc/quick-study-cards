import { RootLayout } from "./components/RootLayout";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface FlashCard {
  id: string;
  front: string;
  back: string;
  status: 'new' | 'learning' | 'learned';
  lastReviewed?: string;
}

interface CardSet {
  id: string;
  name: string;
  cards: FlashCard[];
  created: string;
}

interface UserProgress {
  streak: number;
  lastStudyDate: string;
  cardsLearned: number;
  totalReviews: number;
}

function App() {
  const [cardSets, setCardSets] = useState<CardSet[]>(() => {
    const saved = localStorage.getItem('cardSets');
    return saved ? JSON.parse(saved) : [];
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('progress');
    return saved ? JSON.parse(saved) : {
      streak: 0,
      lastStudyDate: new Date().toISOString(),
      cardsLearned: 0,
      totalReviews: 0
    };
  });

  const [currentCard, setCurrentCard] = useState<FlashCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newSetName, setNewSetName] = useState('');

  useEffect(() => {
    localStorage.setItem('cardSets', JSON.stringify(cardSets));
  }, [cardSets]);

  useEffect(() => {
    localStorage.setItem('progress', JSON.stringify(progress));
  }, [progress]);

  const createNewSet = () => {
    if (!newSetName.trim()) {
      toast.error('Please enter a set name');
      return;
    }

    const newSet: CardSet = {
      id: Date.now().toString(),
      name: newSetName,
      cards: [],
      created: new Date().toISOString()
    };

    setCardSets([...cardSets, newSet]);
    setNewSetName('');
    toast.success('New set created!');
  };

  const addCardToSet = (setId: string, front: string, back: string) => {
    setCardSets(sets => sets.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          cards: [...set.cards, {
            id: Date.now().toString(),
            front,
            back,
            status: 'new'
          }]
        };
      }
      return set;
    }));
  };

  const updateStreak = () => {
    const lastDate = new Date(progress.lastStudyDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      setProgress(p => ({
        ...p,
        streak: p.streak + 1,
        lastStudyDate: today.toISOString()
      }));
    } else if (diffDays > 1) {
      setProgress(p => ({
        ...p,
        streak: 1,
        lastStudyDate: today.toISOString()
      }));
    }
  };

  return (
    <RootLayout>
      <div className="container mx-auto p-4">
        <Tabs defaultValue="study" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="sets">Sets</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="study">
            <Card>
              <CardHeader>
                <CardTitle>Study Cards</CardTitle>
              </CardHeader>
              <CardContent>
                {currentCard ? (
                  <div 
                    className="min-h-[200px] flex items-center justify-center cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <p className="text-xl">{isFlipped ? currentCard.back : currentCard.front}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p>Select a card set to study</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sets">
            <Card>
              <CardHeader>
                <CardTitle>Card Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="New set name"
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                  />
                  <Button onClick={createNewSet}>Create Set</Button>
                </div>
                <div className="grid gap-4">
                  {cardSets.map(set => (
                    <Card key={set.id}>
                      <CardHeader>
                        <CardTitle>{set.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{set.cards.length} cards</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex justify-between">
                    <span>Current Streak:</span>
                    <span>{progress.streak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cards Learned:</span>
                    <span>{progress.cardsLearned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Reviews:</span>
                    <span>{progress.totalReviews}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RootLayout>
  );
}

export default App;