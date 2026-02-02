import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sport.tv' },
    update: {},
    create: {
      email: 'admin@sport.tv',
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      coins: 100,
      moviesEnabled: true,
      seriesEnabled: true
    }
  })
  console.log('Created admin user:', admin.username)

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@sport.tv' },
    update: {},
    create: {
      email: 'user@sport.tv',
      username: 'testuser',
      password: userPassword,
      role: 'user',
      coins: 10,
      passValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      moviesEnabled: false,
      seriesEnabled: false
    }
  })
  console.log('Created test user:', user.username)

  // Create sample channels
  const channels = [
    {
      name: 'ARD',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/ARD_logo.svg/200px-ARD_logo.svg.png',
      streamUrl: 'https://mcdn.daserste.de/daserste/de/master.m3u8',
      order: 1
    },
    {
      name: 'ZDF',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ZDF_logo.svg/200px-ZDF_logo.svg.png',
      streamUrl: 'https://zdf-hls-15.akamaized.net/hls/live/2016498/de/high/master.m3u8',
      order: 2
    },
    {
      name: 'RTL',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/RTL_Logo_2021.svg/200px-RTL_Logo_2021.svg.png',
      streamUrl: 'https://example.com/rtl.m3u8',
      order: 3
    },
    {
      name: 'SAT.1',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Sat.1_logo_2021.svg/200px-Sat.1_logo_2021.svg.png',
      streamUrl: 'https://example.com/sat1.m3u8',
      order: 4
    },
    {
      name: 'ProSieben',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/ProSieben_Logo_2015.svg/200px-ProSieben_Logo_2015.svg.png',
      streamUrl: 'https://example.com/pro7.m3u8',
      order: 5
    }
  ]

  for (const channel of channels) {
    // Check if channel already exists
    const existing = await prisma.channel.findFirst({
      where: { name: channel.name }
    })
    
    if (existing) {
      console.log('Channel already exists:', existing.name)
      continue
    }
    
    const created = await prisma.channel.create({ data: channel })
    console.log('Created channel:', created.name)

    // Create current program for each channel
    const now = new Date()
    await prisma.program.create({
      data: {
        channelId: created.id,
        title: `Live: ${channel.name} Nachrichten`,
        description: 'Aktuelle Nachrichten und Berichte',
        startTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
        endTime: new Date(now.getTime() + 30 * 60 * 1000) // 30 min from now
      }
    })
  }

  // Create sample movies
  const movies = [
    {
      title: 'Die Hard',
      description: 'A New York City police officer tries to save his estranged wife and several others taken hostage by terrorists during a Christmas party.',
      poster: 'https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg',
      year: 1988,
      genre: 'Action',
      rating: 8.2,
      duration: 132,
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    },
    {
      title: 'The Shawshank Redemption',
      description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      year: 1994,
      genre: 'Drama',
      rating: 9.3,
      duration: 142,
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    }
  ]

  for (const movie of movies) {
    const created = await prisma.movie.create({ data: movie })
    console.log('Created movie:', created.title)
  }

  // Create sample series
  const series = await prisma.series.create({
    data: {
      title: 'Breaking Bad',
      description: 'A high school chemistry teacher turned methamphetamine producer partners with a former student.',
      poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      year: 2008,
      genre: 'Crime Drama',
      rating: 9.5
    }
  })
  console.log('Created series:', series.title)

  // Create episodes
  for (let i = 1; i <= 3; i++) {
    await prisma.episode.create({
      data: {
        seriesId: series.id,
        seasonNumber: 1,
        episodeNumber: i,
        title: `Episode ${i}`,
        description: `Breaking Bad Season 1 Episode ${i}`,
        duration: 47,
        videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    })
  }
  console.log('Created 3 episodes for Breaking Bad')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
