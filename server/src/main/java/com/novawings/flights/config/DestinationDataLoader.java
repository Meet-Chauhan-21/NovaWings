package com.novawings.flights.config;

import com.novawings.flights.model.DestinationCard;
import com.novawings.flights.repository.DestinationCardRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds default destination cards on first run
 * Uses FREE Unsplash source URLs — no API key needed
 */
@Component
@Order(2)
public class DestinationDataLoader implements CommandLineRunner {

    @Autowired
    private DestinationCardRepository repo;

    private static final Logger log = LoggerFactory.getLogger(DestinationDataLoader.class);

    @Override
    public void run(String... args) {
        try {
            if (repo.count() > 0) {
                log.info("✅ Destination cards already seeded");
                return;
            }

            log.info("🌄 Seeding destination cards...");

            List<DestinationCard> cards = List.of(

                    // ── FEATURED (larger cards) ─────────────

                    DestinationCard.builder()
                            .title("Goa — Beach Paradise")
                            .destination("Goa")
                            .state("Goa")
                            .tagline("Sun, sand & sea awaits")
                            .description("India's favourite beach destination with stunning coastlines, vibrant nightlife, and Portuguese heritage.")
                            .imageUrl("https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80")
                            .category("Beach")
                            .badge("🔥 Trending")
                            .active(true).featured(true).displayOrder(1)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Kashmir — Heaven on Earth")
                            .destination("Srinagar")
                            .state("Jammu & Kashmir")
                            .tagline("Paradise found in the Himalayas")
                            .description("Snow-capped mountains, serene Dal Lake, and breathtaking valleys make Kashmir truly heaven on earth.")
                            .imageUrl("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80")
                            .category("Hills")
                            .badge("❄️ Winter Escape")
                            .active(true).featured(true).displayOrder(2)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Rajasthan — Royal Heritage")
                            .destination("Jaipur")
                            .state("Rajasthan")
                            .tagline("Land of kings and palaces")
                            .description("Majestic forts, golden deserts, vibrant culture and royal hospitality in the Pink City and beyond.")
                            .imageUrl("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80")
                            .category("Heritage")
                            .badge("👑 Royal Experience")
                            .active(true).featured(true).displayOrder(3)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Kerala — God's Own Country")
                            .destination("Kochi")
                            .state("Kerala")
                            .tagline("Backwaters, spices & serenity")
                            .description("Tranquil backwaters, lush tea gardens, Ayurveda retreats and pristine beaches make Kerala magical.")
                            .imageUrl("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80")
                            .category("Honeymoon")
                            .badge("💕 Honeymoon Special")
                            .active(true).featured(true).displayOrder(4)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    // ── REGULAR CARDS ───────────────────────

                    DestinationCard.builder()
                            .title("Manali — Adventure Capital")
                            .destination("Leh")
                            .state("Himachal Pradesh")
                            .tagline("Thrills in the mountains")
                            .description("Skiing, trekking, river rafting and stunning Himalayan views await in this adventure hub.")
                            .imageUrl("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80")
                            .category("Adventure")
                            .badge("🏔 Adventure")
                            .active(true).featured(false).displayOrder(5)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Varanasi — Spiritual Soul")
                            .destination("Varanasi")
                            .state("Uttar Pradesh")
                            .tagline("Where spirituality meets history")
                            .description("Ancient ghats, evening Ganga Aarti and centuries of spiritual wisdom on the banks of the holy Ganges.")
                            .imageUrl("https://images.unsplash.com/photo-1561361058-c24e02c5ea3c?w=800&q=80")
                            .category("Spiritual")
                            .badge("🕌 Spiritual Journey")
                            .active(true).featured(false).displayOrder(6)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Andaman Islands — Tropical Bliss")
                            .destination("Port Blair")
                            .state("Andaman & Nicobar")
                            .tagline("Crystal waters & coral reefs")
                            .description("Pristine white sand beaches, clear turquoise waters, and world-class snorkelling and diving.")
                            .imageUrl("https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&q=80")
                            .category("Beach")
                            .badge("🐠 Island Escape")
                            .active(true).featured(false).displayOrder(7)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Shimla — Queen of Hills")
                            .destination("Shimla")
                            .state("Himachal Pradesh")
                            .tagline("Cool breeze & colonial charm")
                            .description("Colonial architecture, scenic toy train rides, apple orchards and magnificent mountain views.")
                            .imageUrl("https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80")
                            .category("Hills")
                            .badge("🌿 Refreshing Escape")
                            .active(true).featured(false).displayOrder(8)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Agra — Taj Mahal & More")
                            .destination("Agra")
                            .state("Uttar Pradesh")
                            .tagline("A monument to eternal love")
                            .description("Home to the iconic Taj Mahal, Agra Fort and Fatehpur Sikri — a UNESCO World Heritage jewel.")
                            .imageUrl("https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80")
                            .category("Heritage")
                            .badge("🏛 Must Visit")
                            .active(true).featured(false).displayOrder(9)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Coorg — Scotland of India")
                            .destination("Mysore")
                            .state("Karnataka")
                            .tagline("Misty hills & coffee estates")
                            .description("Rolling coffee and tea plantations, cascading waterfalls and rich wildlife in Karnataka's hill station.")
                            .imageUrl("https://images.unsplash.com/photo-1580637250481-b78db3e6f84b?w=800&q=80")
                            .category("Honeymoon")
                            .badge("💕 Romantic Escape")
                            .active(true).featured(false).displayOrder(10)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Leh Ladakh — The Last Frontier")
                            .destination("Leh")
                            .state("Ladakh")
                            .tagline("Where roads end and adventure begins")
                            .description("High-altitude lakes, ancient monasteries, barren landscapes and the famous Leh-Manali highway.")
                            .imageUrl("https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&q=80")
                            .category("Adventure")
                            .badge("🏍 Bike Trip Favourite")
                            .active(true).featured(false).displayOrder(11)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build(),

                    DestinationCard.builder()
                            .title("Rishikesh — Yoga Capital")
                            .destination("Dehradun")
                            .state("Uttarakhand")
                            .tagline("Adventure & spirituality together")
                            .description("Yoga, meditation, river rafting on the Ganges and the iconic Lakshman Jhula in the foothills of Himalayas.")
                            .imageUrl("https://images.unsplash.com/photo-1600100397608-f781c357f1e2?w=800&q=80")
                            .category("Spiritual")
                            .badge("🧘 Wellness Retreat")
                            .active(true).featured(false).displayOrder(12)
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                            .updatedBy("system").build()
            );

            repo.saveAll(cards);
            log.info("✅ Seeded {} destination cards", cards.size());

        } catch (Exception e) {
            log.error("❌ DestinationDataLoader failed: {}", e.getMessage(), e);
        }
    }
}
