import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Users, 
  Trophy, 
  Star,
  Gamepad2,
  Grid3X3,
  List
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'

const genres = ['All', 'Action', 'Puzzle', 'Racing', 'Strategy', 'Sports', 'Card']

// Mock games data
const games = [
  {
    id: '1',
    name: 'Speed Racer X',
    genre: 'Racing',
    description: 'High-octane racing action with stunning graphics',
    players: 1250,
    prizePool: 5000,
    tournaments: 12,
    image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=400&h=300&fit=crop',
    rating: 4.8,
    featured: true,
  },
  {
    id: '2',
    name: 'Puzzle Master',
    genre: 'Puzzle',
    description: 'Test your brain with challenging puzzles',
    players: 890,
    prizePool: 3500,
    tournaments: 8,
    image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=400&h=300&fit=crop',
    rating: 4.9,
    featured: true,
  },
  {
    id: '3',
    name: 'Battle Arena',
    genre: 'Action',
    description: 'Intense PvP combat in a futuristic arena',
    players: 2100,
    prizePool: 8000,
    tournaments: 15,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
    rating: 4.7,
    featured: true,
  },
  {
    id: '4',
    name: 'Card Legends',
    genre: 'Strategy',
    description: 'Strategic card battles with deck building',
    players: 650,
    prizePool: 2500,
    tournaments: 6,
    image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=300&fit=crop',
    rating: 4.6,
    featured: false,
  },
  {
    id: '5',
    name: 'Soccer Strike',
    genre: 'Sports',
    description: 'Fast-paced soccer action',
    players: 780,
    prizePool: 3000,
    tournaments: 10,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop',
    rating: 4.5,
    featured: false,
  },
  {
    id: '6',
    name: 'Block Breaker',
    genre: 'Puzzle',
    description: 'Classic arcade-style block breaking',
    players: 420,
    prizePool: 1500,
    tournaments: 5,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
    rating: 4.4,
    featured: false,
  },
]

export default function GamesPage() {
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredGames = games.filter(game => {
    const matchesGenre = selectedGenre === 'All' || game.genre === selectedGenre
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGenre && matchesSearch
  })

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Explore Games
          </h1>
          <p className="text-white/50">
            Discover skill-based games and compete for real prizes
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-gaming pl-12"
            />
          </div>

          {/* Genre filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={cn(
                  'px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider whitespace-nowrap',
                  'transition-all duration-200',
                  selectedGenre === genre
                    ? 'bg-neon-cyan text-gaming-dark'
                    : 'bg-gaming-light/50 text-white/70 hover:text-white hover:bg-gaming-light'
                )}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gaming-light/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-neon-cyan text-gaming-dark' : 'text-white/50 hover:text-white'
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-neon-cyan text-gaming-dark' : 'text-white/50 hover:text-white'
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Results count */}
        <div className="mb-6 text-sm text-white/50">
          Showing {filteredGames.length} games
        </div>

        {/* Games Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/games/${game.id}`}>
                  <Card className="group cursor-pointer h-full">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark via-transparent to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Badge variant="info" size="sm">{game.genre}</Badge>
                        {game.featured && (
                          <Badge variant="premium" size="sm">
                            <Star className="w-3 h-3" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gaming-dark/80 rounded-full">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-white">{game.rating}</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-display text-lg font-semibold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-sm text-white/50 mb-4 line-clamp-2">
                        {game.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-white/50">
                            <Users className="w-4 h-4" />
                            <span>{formatNumber(game.players)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/50">
                            <Trophy className="w-4 h-4" />
                            <span>{game.tournaments}</span>
                          </div>
                        </div>
                        <div className="text-neon-green font-semibold">
                          {formatCurrency(game.prizePool)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/games/${game.id}`}>
                  <Card className="group cursor-pointer">
                    <div className="flex items-center gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={game.image}
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors">
                            {game.name}
                          </h3>
                          <Badge variant="info" size="sm">{game.genre}</Badge>
                          {game.featured && (
                            <Badge variant="premium" size="sm">Featured</Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/50 mb-2 line-clamp-1">
                          {game.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-white/50">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{game.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/50">
                            <Users className="w-4 h-4" />
                            <span>{formatNumber(game.players)} players</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/50">
                            <Trophy className="w-4 h-4" />
                            <span>{game.tournaments} tournaments</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Prize pool */}
                      <div className="text-right">
                        <div className="text-sm text-white/50 mb-1">Prize Pool</div>
                        <div className="font-display text-xl font-bold text-neon-green">
                          {formatCurrency(game.prizePool)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <Gamepad2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-white mb-2">
              No games found
            </h3>
            <p className="text-white/50 mb-6">
              Try adjusting your filters or search query
            </p>
            <Button variant="secondary" onClick={() => {
              setSelectedGenre('All')
              setSearchQuery('')
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
