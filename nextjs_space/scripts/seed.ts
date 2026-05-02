import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u00e4]/g, "ae").replace(/[\u00f6]/g, "oe").replace(/[\u00fc]/g, "ue").replace(/[\u00df]/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  console.log("Seeding database...");

  // Users
  const adminPassword = await bcrypt.hash("johndoe123", 12);
  const adminExtraPassword = await bcrypt.hash("admin123", 12);
  const admin1Password = await bcrypt.hash("Admin123@", 12);
  const authorPassword = await bcrypt.hash("author123", 12);

  const testAdmin = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: { email: "john@doe.com", password: adminPassword, name: "John Doe", role: "ADMIN", slug: "john-doe" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", password: adminExtraPassword, name: "Admin", role: "ADMIN", slug: "admin" },
  });

  const admin1 = await prisma.user.upsert({
    where: { email: "admin1@example.com" },
    update: {},
    create: { email: "admin1@example.com", password: admin1Password, name: "Admin1", role: "ADMIN", slug: "admin1" },
  });

  const author1 = await prisma.user.upsert({
    where: { email: "author1@example.com" },
    update: {},
    create: { email: "author1@example.com", password: authorPassword, name: "Max M\u00FCller", role: "AUTHOR", slug: "max-mueller", bio: "Reiseblogger und Fotograf. Leidenschaftlich unterwegs in Europa und Asien." },
  });

  const author2 = await prisma.user.upsert({
    where: { email: "author2@example.com" },
    update: {},
    create: { email: "author2@example.com", password: authorPassword, name: "Anna Schmidt", role: "AUTHOR", slug: "anna-schmidt", bio: "Abenteuerlust und Fernweh \u2013 Geschichten vom Reisen und Entdecken." },
  });

  // Categories
  const cat1 = await prisma.category.upsert({
    where: { slug: "staedtereisen" },
    update: {},
    create: { name: "St\u00E4dtereisen", slug: "staedtereisen", description: "Entdecken Sie die sch\u00F6nsten St\u00E4dte der Welt" },
  });

  const cat2 = await prisma.category.upsert({
    where: { slug: "strandurlaub" },
    update: {},
    create: { name: "Strandurlaub", slug: "strandurlaub", description: "Sonne, Strand und Meer" },
  });

  const cat3 = await prisma.category.upsert({
    where: { slug: "berge-und-natur" },
    update: {},
    create: { name: "Berge & Natur", slug: "berge-und-natur", description: "Wandern, Klettern und die Natur genie\u00DFen" },
  });

  const cat4 = await prisma.category.upsert({
    where: { slug: "kulinarische-reisen" },
    update: {},
    create: { name: "Kulinarische Reisen", slug: "kulinarische-reisen", description: "Die Welt durch ihren Geschmack entdecken" },
  });

  // Tags
  const tagNames = [
    "Europa", "Asien", "Strand", "Wandern", "Kulinarik", "Abenteuer",
    "Kultur", "Architektur", "Natur", "Budget-Reisen", "Luxusreisen", "Fotografie",
  ];
  const tags: Record<string, any> = {};
  for (const name of tagNames) {
    const slug = slugify(name);
    tags[slug] = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  // Posts
  const post1 = await prisma.post.upsert({
    where: { slug: "die-schoensten-viertel-von-barcelona" },
    update: {},
    create: {
      title: "Die sch\u00F6nsten Viertel von Barcelona",
      slug: "die-schoensten-viertel-von-barcelona",
      excerpt: "Barcelona ist eine Stadt voller Leben, Architektur und Kultur. Entdecken Sie die charmantesten Viertel der katalanischen Hauptstadt.",
      content: `<h2>Barcelona \u2013 eine Stadt, die verzaubert</h2><p>Barcelona geh\u00F6rt zu den faszinierendsten St\u00E4dten Europas. Von den gotischen Gassen bis zu den modernistischen Bauten Gaud\u00EDs bietet sie ein unvergessliches Erlebnis f\u00FCr jeden Reisenden.</p><h3>Das Gotische Viertel (Barri G\u00F2tic)</h3><p>Das Herz der Altstadt ist ein Labyrinth aus engen Gassen, versteckten Pl\u00E4tzen und mittelalterlicher Architektur. Hier finden Sie die beeindruckende Kathedrale von Barcelona und zahlreiche gem\u00FCtliche Tapas-Bars.</p><h3>Eixample \u2013 Das Viertel der Modernisten</h3><p>In diesem eleganten Viertel reihen sich die ber\u00FChmtesten Werke von Antoni Gaud\u00ED aneinander:</p><ul><li>Casa Batll\u00F3</li><li>Casa Mil\u00E0 (La Pedrera)</li><li>Die Sagrada Fam\u00EDlia</li></ul><h3>Barceloneta \u2013 Strand und Meer</h3><p>Das ehemalige Fischerviertel bietet den perfekten Mix aus Strandleben und authentischer Atmosph\u00E4re. Genie\u00DFen Sie frische Meeresfr\u00FCchte in den Restaurants direkt am Meer.</p><blockquote><p>\u201EBarcelona hat dieses Licht, das einen sofort in den Bann zieht.\u201C</p></blockquote><p>Egal ob Sie Kultur, Kulinarik oder einfach das mediterrane Lebensgef\u00FChl suchen \u2013 Barcelona wird Sie begeistern.</p>`,
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: author1.id,
      categoryId: cat1.id,
      metaTitle: "Die sch\u00F6nsten Viertel von Barcelona \u2013 Reiseblog",
      metaDescription: "Entdecken Sie die charmantesten Viertel Barcelonas: vom Gotischen Viertel \u00FCber Eixample bis Barceloneta.",
    },
  });

  const post2 = await prisma.post.upsert({
    where: { slug: "traumstraende-auf-den-malediven" },
    update: {},
    create: {
      title: "Traumstr\u00E4nde auf den Malediven",
      slug: "traumstraende-auf-den-malediven",
      excerpt: "Wei\u00DFer Sand, t\u00FCrkisblaues Wasser und endlose Ruhe \u2013 die Malediven sind das perfekte Reiseziel f\u00FCr Erholung.",
      content: `<h2>Paradies auf Erden</h2><p>Die Malediven bestehen aus \u00FCber 1.000 Inseln im Indischen Ozean und sind weltbekannt f\u00FCr ihre unber\u00FChrten Str\u00E4nde, kristallklares Wasser und luxuri\u00F6se \u00DCberwasservillen.</p><h3>Die besten Str\u00E4nde</h3><p>Jede Insel hat ihren eigenen Charme, aber diese Str\u00E4nde sind besonders empfehlenswert:</p><ul><li><strong>Hulhumal\u00E9 Beach</strong> \u2013 Perfekt f\u00FCr Budget-Reisende</li><li><strong>Veligandu Island</strong> \u2013 Endloser Sandstrand</li><li><strong>Maafushi</strong> \u2013 Lokale Kultur und g\u00FCnstige G\u00E4steh\u00E4user</li></ul><h3>Schnorcheln und Tauchen</h3><p>Die Unterwasserwelt der Malediven ist ein Traum f\u00FCr Schnorchler und Taucher. Bunte Korallenriffe, Mantarochen und sogar Walhaie erwarten Sie hier.</p><p>Der beste Zeitraum f\u00FCr einen Besuch ist von November bis April, wenn die Trockenzeit herrscht und das Meer ruhig ist.</p>`,
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000),
      authorId: author2.id,
      categoryId: cat2.id,
      metaTitle: "Traumstr\u00E4nde auf den Malediven \u2013 Reiseblog",
      metaDescription: "Entdecken Sie die sch\u00F6nsten Str\u00E4nde der Malediven und Tipps f\u00FCr Ihren Traumurlaub.",
    },
  });

  const post3 = await prisma.post.upsert({
    where: { slug: "wandern-in-den-schweizer-alpen" },
    update: {},
    create: {
      title: "Wandern in den Schweizer Alpen",
      slug: "wandern-in-den-schweizer-alpen",
      excerpt: "Die Schweizer Alpen bieten atemberaubende Wanderwege f\u00FCr jeden Anspruch \u2013 von gem\u00FCtlichen Spazierg\u00E4ngen bis zu anspruchsvollen Gipfeltouren.",
      content: `<h2>Die Schweizer Alpen \u2013 Ein Paradies f\u00FCr Wanderer</h2><p>Mit \u00FCber 65.000 Kilometern markierter Wanderwege ist die Schweiz das Traumziel f\u00FCr Naturliebhaber und Outdoor-Enthusiasten.</p><h3>Top Wanderwege</h3><ul><li><strong>Eiger Trail</strong> \u2013 Am Fu\u00DF der ber\u00FChmten Eiger-Nordwand</li><li><strong>5-Seen-Wanderung Pizol</strong> \u2013 F\u00FCnf Bergseen in einer Tour</li><li><strong>Oeschinensee Rundweg</strong> \u2013 Traumhafter Bergsee bei Kandersteg</li></ul><h3>Praktische Tipps</h3><p>Die beste Jahreszeit zum Wandern in den Alpen ist von Juni bis Oktober.</p><blockquote><p>\u201EDie Berge rufen und ich muss gehen.\u201C \u2013 John Muir</p></blockquote>`,
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 172800000),
      authorId: author1.id,
      categoryId: cat3.id,
      metaTitle: "Wandern in den Schweizer Alpen \u2013 Reiseblog",
      metaDescription: "Die besten Wanderwege in den Schweizer Alpen mit praktischen Tipps f\u00FCr Ihre Tour.",
    },
  });

  const post4 = await prisma.post.upsert({
    where: { slug: "street-food-in-bangkok" },
    update: {},
    create: {
      title: "Street Food in Bangkok \u2013 Ein kulinarisches Abenteuer",
      slug: "street-food-in-bangkok",
      excerpt: "Bangkoks Stra\u00DFenk\u00FCchen bieten eine unglaubliche Vielfalt an Aromen und Geschm\u00E4ckern.",
      content: `<h2>Bangkok \u2013 Die Hauptstadt des Street Food</h2><p>Bangkok ist weltweit bekannt f\u00FCr seine lebendige Street-Food-Szene.</p><h3>Die besten M\u00E4rkte</h3><ul><li><strong>Yaowarat (Chinatown)</strong> \u2013 Das Mekka f\u00FCr n\u00E4chtliches Street Food</li><li><strong>Or Tor Kor Market</strong> \u2013 Frische Fr\u00FCchte und Premium Street Food</li></ul><h3>Must-Try Gerichte</h3><ul><li><strong>Pad Thai</strong></li><li><strong>Som Tam</strong></li><li><strong>Mango Sticky Rice</strong></li><li><strong>Tom Yum Goong</strong></li></ul>`,
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 259200000),
      authorId: author2.id,
      categoryId: cat4.id,
      metaTitle: "Street Food in Bangkok \u2013 Reiseblog",
      metaDescription: "Die besten Street-Food-M\u00E4rkte und Gerichte in Bangkok entdecken.",
    },
  });

  // PostTag connections
  const postTagPairs = [
    { postSlug: "die-schoensten-viertel-von-barcelona", tagSlugs: ["europa", "kultur", "architektur"] },
    { postSlug: "traumstraende-auf-den-malediven", tagSlugs: ["asien", "strand", "luxusreisen", "natur"] },
    { postSlug: "wandern-in-den-schweizer-alpen", tagSlugs: ["europa", "wandern", "natur", "abenteuer", "fotografie"] },
    { postSlug: "street-food-in-bangkok", tagSlugs: ["asien", "kulinarik", "budget-reisen", "abenteuer"] },
  ];

  for (const { postSlug, tagSlugs } of postTagPairs) {
    const post = await prisma.post.findUnique({ where: { slug: postSlug } });
    if (!post) continue;
    for (const tagSlug of tagSlugs) {
      const tag = tags[tagSlug];
      if (!tag) continue;
      await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post.id, tagId: tag.id } },
        update: {},
        create: { postId: post.id, tagId: tag.id },
      });
    }
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
