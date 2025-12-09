import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Filter, Ticket, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const events = [
  {
    id: 1,
    title: "The First Step of ASIREX - Towards a Cleaner Nation",
    type: "Launch",
    date: "February 17, 2026",
    time: "10:00 AM - 2:00 PM",
    location: "Noida, India",
    venue: "ASIREX Headquarters",
    description: "Witness the historic moment as ASIREX takes its first step towards transforming India. Experience the unveiling of our Aqua River Purifier prototype - the AI-powered autonomous water purification system that will clean India's sacred rivers. Be part of the revolution that starts with a single bot and grows into a nationwide fleet.",
    image: "🌊",
    price: 0,
    capacity: 1000,
    registered: 847,
    tags: ["Launch", "Aqua Purifier", "Free Entry", "Historic"],
    isFeatured: true,
  },
  {
    id: 2,
    title: "ASIREX Official Launch Event",
    type: "Launch",
    date: "March 15, 2026",
    time: "11:00 AM - 5:00 PM",
    location: "Delhi, India",
    venue: "India Habitat Centre",
    description: "The grand official launch of ASIREX Technologies. Meet the founders, explore our product lineup, witness live demos of AI-powered solutions, and discover how we're building the new future of India with cutting-edge robotics and clean technology.",
    image: "🚀",
    price: 0,
    capacity: 3000,
    registered: 2156,
    tags: ["Launch", "Networking", "Free Entry"],
    isFeatured: true,
  },
  {
    id: 3,
    title: "ASIREX Tech Summit 2026",
    type: "Conference",
    date: "April 20, 2026",
    time: "9:00 AM - 6:00 PM",
    location: "Bangalore, India",
    venue: "Bangalore International Exhibition Centre",
    description: "Join 5000+ tech enthusiasts for India's largest AI and robotics conference. Featuring keynotes from industry leaders, hands-on workshops, live Aqua Purifier demonstrations, and exclusive product launches.",
    image: "🎯",
    price: 2999,
    capacity: 5000,
    registered: 3847,
    tags: ["AI", "Robotics", "Networking"],
    isFeatured: false,
  },
  {
    id: 4,
    title: "Developer Workshop: AI Edge Computing",
    type: "Workshop",
    date: "March 28, 2026",
    time: "4:00 PM - 8:00 PM",
    location: "Gurugram, India",
    venue: "ASIREX Innovation Lab",
    description: "Hands-on workshop covering edge AI deployment, neural network optimization, and real-world applications. Learn how we built the AI brain behind the Aqua River Purifier. Limited seats, early registration recommended.",
    image: "💻",
    price: 999,
    capacity: 50,
    registered: 42,
    tags: ["Hands-on", "AI", "Edge Computing"],
    isFeatured: false,
  },
  {
    id: 5,
    title: "Clean River Initiative Meetup",
    type: "Meetup",
    date: "May 10, 2026",
    time: "5:00 PM - 8:00 PM",
    location: "Mumbai, India",
    venue: "Gateway of India Convention Hall",
    description: "Join environmental enthusiasts, government officials, and tech innovators to discuss the deployment of Aqua River Purifier bots across Maharashtra's rivers. Network with like-minded individuals passionate about clean water.",
    image: "💧",
    price: 0,
    capacity: 500,
    registered: 289,
    tags: ["Environment", "Networking", "Free Entry"],
    isFeatured: false,
  },
  {
    id: 6,
    title: "Smart Air Solutions Workshop",
    type: "Workshop",
    date: "April 5, 2026",
    time: "10:00 AM - 4:00 PM",
    location: "Faridabad, India",
    venue: "ASIREX Clean Tech Center",
    description: "Deep dive into our Smart Air Pollution Reducer technology. Learn about UV purification, HEPA filtration, ionization, and self-cleaning filter systems. Hands-on experience with prototype units.",
    image: "💨",
    price: 1499,
    capacity: 100,
    registered: 78,
    tags: ["Air Quality", "Clean Tech", "Hands-on"],
    isFeatured: false,
  },
  {
    id: 7,
    title: "ASIREX Investors & Partners Summit",
    type: "Conference",
    date: "June 15, 2026",
    time: "9:00 AM - 3:00 PM",
    location: "Delhi, India",
    venue: "The Oberoi, New Delhi",
    description: "Exclusive summit for potential investors, government partners, and strategic collaborators. Discover investment opportunities in India's most ambitious clean tech and AI robotics venture.",
    image: "🤝",
    price: 4999,
    capacity: 200,
    registered: 156,
    tags: ["Investment", "B2B", "Exclusive"],
    isFeatured: false,
  },
];

const cities = ["All Locations", "Noida", "Delhi", "Gurugram", "Faridabad", "Mumbai", "Bangalore"];
const types = ["All Types", "Conference", "Workshop", "Meetup", "Launch"];

export default function Events() {
  const [selectedCity, setSelectedCity] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);

  const filteredEvents = events.filter((event) => {
    const cityMatch = selectedCity === "All Locations" || event.location.includes(selectedCity);
    const typeMatch = selectedType === "All Types" || event.type === selectedType;
    return cityMatch && typeMatch;
  });

  const getAvailability = (event: typeof events[0]) => {
    const remaining = event.capacity - event.registered;
    const percentage = (event.registered / event.capacity) * 100;
    if (percentage >= 95) return { text: "Almost Full", color: "text-destructive" };
    if (percentage >= 70) return { text: "Filling Fast", color: "text-warm-accent" };
    return { text: `${remaining} spots left`, color: "text-accent" };
  };

  return (
    <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Events & <span className="gradient-text">Explore</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with the ASIREX community at conferences, workshops, and meetups 
              across India.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-44 bg-muted/50">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40 bg-muted/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Events List */}
          <div className="space-y-6">
            {filteredEvents.map((event, index) => {
              const availability = getAvailability(event);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className={`glass-card card-hover overflow-hidden ${event.isFeatured ? "ring-1 ring-accent/30" : ""}`}>
                    {event.isFeatured && (
                      <div className="bg-gradient-to-r from-accent to-primary px-4 py-1.5">
                        <span className="text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                          Featured Event
                        </span>
                      </div>
                    )}
                    <div className="p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Event Icon */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl flex-shrink-0">
                          {event.image}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/20 text-secondary">
                              {event.type}
                            </span>
                            {event.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h3 className="font-display text-xl lg:text-2xl font-semibold mb-3 group-hover:text-accent transition-colors">
                            {event.title}
                          </h3>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                          </div>

                          <p className="text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        {/* Price & CTA */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-display text-2xl font-bold">
                              {event.price === 0 ? "Free" : `₹${event.price.toLocaleString()}`}
                            </div>
                            <div className={`text-sm ${availability.color}`}>
                              <Users className="w-3 h-3 inline mr-1" />
                              {availability.text}
                            </div>
                          </div>
                          <Button variant="hero" className="whitespace-nowrap">
                            Register Now
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground text-lg">
                No events found. Try adjusting your filters.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl glass-card border-border">
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">
                    {selectedEvent.image}
                  </div>
                  <div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/20 text-secondary">
                      {selectedEvent.type}
                    </span>
                    <DialogTitle className="font-display text-xl lg:text-2xl mt-2">
                      {selectedEvent.title}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Event Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass-card p-4 bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                    <div className="font-medium">{selectedEvent.date}</div>
                    <div className="text-sm text-muted-foreground">{selectedEvent.time}</div>
                  </div>
                  <div className="glass-card p-4 bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="font-medium">{selectedEvent.location}</div>
                    <div className="text-sm text-muted-foreground">{selectedEvent.venue}</div>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {selectedEvent.description}
                </p>

                {/* Capacity */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Registration Progress</span>
                    <span className="font-medium">
                      {selectedEvent.registered} / {selectedEvent.capacity}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(selectedEvent.registered / selectedEvent.capacity) * 100}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Register */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Registration Fee</div>
                    <div className="font-display text-3xl font-bold">
                      {selectedEvent.price === 0 ? "Free" : `₹${selectedEvent.price.toLocaleString()}`}
                    </div>
                  </div>
                  <Button variant="hero" size="lg">
                    <Ticket className="w-4 h-4 mr-2" />
                    Register Now
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
