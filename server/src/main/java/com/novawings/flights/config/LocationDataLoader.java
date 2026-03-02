package com.novawings.flights.config;

import com.novawings.flights.model.Location;
import com.novawings.flights.repository.LocationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds location data into MongoDB on first run.
 * Runs BEFORE FlightDataLoader (Order 1).
 */
@Component
@Order(1)
public class LocationDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LocationDataLoader.class);

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public void run(String... args) {
        if (locationRepository.count() >= 90) {
            log.info("✅ All locations seeded — skipping");
            return;
        }

        // Delete old incomplete set and reseed
        locationRepository.deleteAll();
        log.info("🗑️ Removed old locations — reseeding all");

        log.info("🌍 Seeding location data...");

        LocalDateTime now = LocalDateTime.now();

        List<Location> locations = List.of(

                // ── Metro Cities ──
                Location.builder()
                        .city("Delhi").state("Delhi").country("India")
                        .airportCode("DEL")
                        .airportName("Indira Gandhi International Airport")
                        .type("metro").active(true)
                        .displayOrder(1).showOnExplore(true).showOnHome(true)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Mumbai").state("Maharashtra").country("India")
                        .airportCode("BOM")
                        .airportName("Chhatrapati Shivaji Maharaj International Airport")
                        .type("metro").active(true)
                        .displayOrder(2).showOnExplore(true).showOnHome(true)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Bangalore").state("Karnataka").country("India")
                        .airportCode("BLR")
                        .airportName("Kempegowda International Airport")
                        .type("metro").active(true)
                        .displayOrder(3).showOnExplore(true).showOnHome(true)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Chennai").state("Tamil Nadu").country("India")
                        .airportCode("MAA")
                        .airportName("Chennai International Airport")
                        .type("metro").active(true)
                        .displayOrder(4).showOnExplore(true).showOnHome(true)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Kolkata").state("West Bengal").country("India")
                        .airportCode("CCU")
                        .airportName("Netaji Subhas Chandra Bose International Airport")
                        .type("metro").active(true)
                        .displayOrder(5).showOnExplore(true).showOnHome(true)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Hyderabad").state("Telangana").country("India")
                        .airportCode("HYD")
                        .airportName("Rajiv Gandhi International Airport")
                        .type("metro").active(true)
                        .displayOrder(6).showOnExplore(true).showOnHome(true)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Ahmedabad").state("Gujarat").country("India")
                        .airportCode("AMD")
                        .airportName("Sardar Vallabhbhai Patel International Airport")
                        .type("metro").active(true)
                        .displayOrder(7).showOnExplore(true).showOnHome(true)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Pune").state("Maharashtra").country("India")
                        .airportCode("PNQ")
                        .airportName("Pune Airport")
                        .type("metro").active(true)
                        .displayOrder(8).showOnExplore(true).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Major Cities ──
                Location.builder()
                        .city("Jaipur").state("Rajasthan").country("India")
                        .airportCode("JAI")
                        .airportName("Jaipur International Airport")
                        .type("city").active(true)
                        .displayOrder(9).showOnExplore(true).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Surat").state("Gujarat").country("India")
                        .airportCode("STV")
                        .airportName("Surat Airport")
                        .type("city").active(true)
                        .displayOrder(10).showOnExplore(true).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Goa").state("Goa").country("India")
                        .airportCode("GOI")
                        .airportName("Goa International Airport")
                        .type("city").active(true)
                        .displayOrder(11).showOnExplore(true).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Lucknow").state("Uttar Pradesh").country("India")
                        .airportCode("LKO")
                        .airportName("Chaudhary Charan Singh Airport")
                        .type("city").active(true)
                        .displayOrder(12).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Kochi").state("Kerala").country("India")
                        .airportCode("COK")
                        .airportName("Cochin International Airport")
                        .type("city").active(true)
                        .displayOrder(13).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Guwahati").state("Assam").country("India")
                        .airportCode("GAU")
                        .airportName("Lokpriya Gopinath Bordoloi Airport")
                        .type("city").active(true)
                        .displayOrder(15).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Leh").state("Ladakh").country("India")
                        .airportCode("IXL")
                        .airportName("Kushok Bakula Rimpochhe Airport")
                        .type("city").active(true)
                        .displayOrder(16).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Srinagar").state("Jammu & Kashmir").country("India")
                        .airportCode("SXR")
                        .airportName("Sheikh ul-Alam International Airport")
                        .type("city").active(true)
                        .displayOrder(17).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Varanasi").state("Uttar Pradesh").country("India")
                        .airportCode("VNS")
                        .airportName("Lal Bahadur Shastri Airport")
                        .type("city").active(true)
                        .displayOrder(18).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Amritsar").state("Punjab").country("India")
                        .airportCode("ATQ")
                        .airportName("Sri Guru Ram Dass Jee Airport")
                        .type("city").active(true)
                        .displayOrder(19).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Bhubaneswar").state("Odisha").country("India")
                        .airportCode("BBI")
                        .airportName("Biju Patnaik International Airport")
                        .type("city").active(true)
                        .displayOrder(21).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Nagpur").state("Maharashtra").country("India")
                        .airportCode("NAG")
                        .airportName("Dr. Babasaheb Ambedkar Airport")
                        .type("city").active(true)
                        .displayOrder(22).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Indore").state("Madhya Pradesh").country("India")
                        .airportCode("IDR")
                        .airportName("Devi Ahilya Bai Holkar Airport")
                        .type("city").active(true)
                        .displayOrder(23).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Coimbatore").state("Tamil Nadu").country("India")
                        .airportCode("CJB")
                        .airportName("Coimbatore International Airport")
                        .type("city").active(true)
                        .displayOrder(24).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Visakhapatnam").state("Andhra Pradesh").country("India")
                        .airportCode("VTZ")
                        .airportName("Visakhapatnam Airport")
                        .type("city").active(true)
                        .displayOrder(25).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Dehradun").state("Uttarakhand").country("India")
                        .airportCode("DED")
                        .airportName("Jolly Grant Airport")
                        .type("city").active(true)
                        .displayOrder(26).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Raipur").state("Chhattisgarh").country("India")
                        .airportCode("RPR")
                        .airportName("Swami Vivekananda Airport")
                        .type("city").active(true)
                        .displayOrder(27).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Ranchi").state("Jharkhand").country("India")
                        .airportCode("IXR")
                        .airportName("Birsa Munda Airport")
                        .type("city").active(true)
                        .displayOrder(28).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Patna").state("Bihar").country("India")
                        .airportCode("PAT")
                        .airportName("Jay Prakash Narayan Airport")
                        .type("city").active(true)
                        .displayOrder(29).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Port Blair").state("Andaman & Nicobar").country("India")
                        .airportCode("IXZ")
                        .airportName("Veer Savarkar International Airport")
                        .type("city").active(true)
                        .displayOrder(30).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Bhopal").state("Madhya Pradesh").country("India")
                        .airportCode("BHO")
                        .airportName("Raja Bhoj Airport")
                        .type("city").active(true)
                        .displayOrder(31).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Andhra Pradesh ──
                Location.builder()
                        .city("Vijayawada").state("Andhra Pradesh").country("India")
                        .airportCode("VGA")
                        .airportName("Vijayawada International Airport")
                        .type("city").active(true)
                        .displayOrder(32).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Tirupati").state("Andhra Pradesh").country("India")
                        .airportCode("TIR")
                        .airportName("Tirupati Airport")
                        .type("city").active(true)
                        .displayOrder(33).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Rajahmundry").state("Andhra Pradesh").country("India")
                        .airportCode("RJA")
                        .airportName("Rajahmundry Airport")
                        .type("city").active(true)
                        .displayOrder(34).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Arunachal Pradesh ──
                Location.builder()
                        .city("Itanagar").state("Arunachal Pradesh").country("India")
                        .airportCode("HGI")
                        .airportName("Donyi Polo Airport")
                        .type("city").active(true)
                        .displayOrder(35).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Assam ──
                Location.builder()
                        .city("Jorhat").state("Assam").country("India")
                        .airportCode("JRH")
                        .airportName("Jorhat Airport")
                        .type("city").active(true)
                        .displayOrder(36).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Tezpur").state("Assam").country("India")
                        .airportCode("TEZ")
                        .airportName("Tezpur Airport")
                        .type("city").active(true)
                        .displayOrder(37).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Dibrugarh").state("Assam").country("India")
                        .airportCode("DIB")
                        .airportName("Dibrugarh Airport")
                        .type("city").active(true)
                        .displayOrder(38).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Silchar").state("Assam").country("India")
                        .airportCode("IXS")
                        .airportName("Silchar Airport")
                        .type("city").active(true)
                        .displayOrder(39).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Bihar ──
                Location.builder()
                        .city("Gaya").state("Bihar").country("India")
                        .airportCode("GAY")
                        .airportName("Gaya International Airport")
                        .type("city").active(true)
                        .displayOrder(40).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Chhattisgarh ──
                Location.builder()
                        .city("Bilaspur").state("Chhattisgarh").country("India")
                        .airportCode("PAB")
                        .airportName("Bilaspur Airport")
                        .type("city").active(true)
                        .displayOrder(41).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Gujarat ──
                Location.builder()
                        .city("Bhavnagar").state("Gujarat").country("India")
                        .airportCode("BHU")
                        .airportName("Bhavnagar Airport")
                        .type("city").active(true)
                        .displayOrder(42).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Jamnagar").state("Gujarat").country("India")
                        .airportCode("JGA")
                        .airportName("Jamnagar Airport")
                        .type("city").active(true)
                        .displayOrder(43).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Porbandar").state("Gujarat").country("India")
                        .airportCode("PBD")
                        .airportName("Porbandar Airport")
                        .type("city").active(true)
                        .displayOrder(44).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Kandla").state("Gujarat").country("India")
                        .airportCode("IXY")
                        .airportName("Kandla Airport")
                        .type("city").active(true)
                        .displayOrder(45).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Haryana ──
                Location.builder()
                        .city("Hisar").state("Haryana").country("India")
                        .airportCode("HSS")
                        .airportName("Hisar Airport")
                        .type("city").active(true)
                        .displayOrder(46).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Himachal Pradesh ──
                Location.builder()
                        .city("Kullu").state("Himachal Pradesh").country("India")
                        .airportCode("KUU")
                        .airportName("Kullu Manali Airport")
                        .type("city").active(true)
                        .displayOrder(47).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Dharamshala").state("Himachal Pradesh").country("India")
                        .airportCode("DHM")
                        .airportName("Gaggal Airport")
                        .type("city").active(true)
                        .displayOrder(48).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Jharkhand ──
                Location.builder()
                        .city("Jamshedpur").state("Jharkhand").country("India")
                        .airportCode("IXW")
                        .airportName("Sonari Airport")
                        .type("city").active(true)
                        .displayOrder(49).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Deoghar").state("Jharkhand").country("India")
                        .airportCode("DGH")
                        .airportName("Deoghar Airport")
                        .type("city").active(true)
                        .displayOrder(50).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Karnataka ──
                Location.builder()
                        .city("Hubli").state("Karnataka").country("India")
                        .airportCode("HBX")
                        .airportName("Hubli Airport")
                        .type("city").active(true)
                        .displayOrder(51).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Belgaum").state("Karnataka").country("India")
                        .airportCode("IXG")
                        .airportName("Belgaum Airport")
                        .type("city").active(true)
                        .displayOrder(52).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Mysore").state("Karnataka").country("India")
                        .airportCode("MYQ")
                        .airportName("Mysore Airport")
                        .type("city").active(true)
                        .displayOrder(53).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Mangalore").state("Karnataka").country("India")
                        .airportCode("IXE")
                        .airportName("Mangalore International Airport")
                        .type("city").active(true)
                        .displayOrder(54).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Kerala ──
                Location.builder()
                        .city("Kozhikode").state("Kerala").country("India")
                        .airportCode("CCJ")
                        .airportName("Calicut International Airport")
                        .type("city").active(true)
                        .displayOrder(55).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Kannur").state("Kerala").country("India")
                        .airportCode("CNN")
                        .airportName("Kannur International Airport")
                        .type("city").active(true)
                        .displayOrder(56).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Thiruvananthapuram").state("Kerala").country("India")
                        .airportCode("TRV")
                        .airportName("Trivandrum International Airport")
                        .type("city").active(true)
                        .displayOrder(57).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Madhya Pradesh ──
                Location.builder()
                        .city("Gwalior").state("Madhya Pradesh").country("India")
                        .airportCode("GWL")
                        .airportName("Gwalior Airport")
                        .type("city").active(true)
                        .displayOrder(58).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Jabalpur").state("Madhya Pradesh").country("India")
                        .airportCode("JLR")
                        .airportName("Jabalpur Airport")
                        .type("city").active(true)
                        .displayOrder(59).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Khajuraho").state("Madhya Pradesh").country("India")
                        .airportCode("HJR")
                        .airportName("Khajuraho Airport")
                        .type("city").active(true)
                        .displayOrder(60).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Maharashtra ──
                Location.builder()
                        .city("Kolhapur").state("Maharashtra").country("India")
                        .airportCode("KLH")
                        .airportName("Kolhapur Airport")
                        .type("city").active(true)
                        .displayOrder(61).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Nanded").state("Maharashtra").country("India")
                        .airportCode("NDC")
                        .airportName("Nanded Airport")
                        .type("city").active(true)
                        .displayOrder(62).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Solapur").state("Maharashtra").country("India")
                        .airportCode("SSE")
                        .airportName("Solapur Airport")
                        .type("city").active(true)
                        .displayOrder(63).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Manipur ──
                Location.builder()
                        .city("Imphal").state("Manipur").country("India")
                        .airportCode("IMF")
                        .airportName("Imphal International Airport")
                        .type("city").active(true)
                        .displayOrder(64).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Meghalaya ──
                Location.builder()
                        .city("Shillong").state("Meghalaya").country("India")
                        .airportCode("SHL")
                        .airportName("Shillong Airport")
                        .type("city").active(true)
                        .displayOrder(65).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Mizoram ──
                Location.builder()
                        .city("Aizawl").state("Mizoram").country("India")
                        .airportCode("AJL")
                        .airportName("Lengpui Airport")
                        .type("city").active(true)
                        .displayOrder(66).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Nagaland ──
                Location.builder()
                        .city("Dimapur").state("Nagaland").country("India")
                        .airportCode("DMU")
                        .airportName("Dimapur Airport")
                        .type("city").active(true)
                        .displayOrder(67).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Odisha ──
                Location.builder()
                        .city("Jharsuguda").state("Odisha").country("India")
                        .airportCode("JRG")
                        .airportName("Veer Surendra Sai Airport")
                        .type("city").active(true)
                        .displayOrder(68).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Punjab ──
                Location.builder()
                        .city("Pathankot").state("Punjab").country("India")
                        .airportCode("IXP")
                        .airportName("Pathankot Airport")
                        .type("city").active(true)
                        .displayOrder(69).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Rajasthan ──
                Location.builder()
                        .city("Udaipur").state("Rajasthan").country("India")
                        .airportCode("UDR")
                        .airportName("Maharana Pratap Airport")
                        .type("city").active(true)
                        .displayOrder(70).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Jodhpur").state("Rajasthan").country("India")
                        .airportCode("JDH")
                        .airportName("Jodhpur Airport")
                        .type("city").active(true)
                        .displayOrder(71).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Bikaner").state("Rajasthan").country("India")
                        .airportCode("BKB")
                        .airportName("Nal Airport")
                        .type("city").active(true)
                        .displayOrder(72).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Kota").state("Rajasthan").country("India")
                        .airportCode("KTU")
                        .airportName("Kota Airport")
                        .type("city").active(true)
                        .displayOrder(73).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Sikkim ──
                Location.builder()
                        .city("Gangtok").state("Sikkim").country("India")
                        .airportCode("PYG")
                        .airportName("Pakyong Airport")
                        .type("city").active(true)
                        .displayOrder(74).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Tamil Nadu ──
                Location.builder()
                        .city("Madurai").state("Tamil Nadu").country("India")
                        .airportCode("IXM")
                        .airportName("Madurai Airport")
                        .type("city").active(true)
                        .displayOrder(75).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Tiruchirappalli").state("Tamil Nadu").country("India")
                        .airportCode("TRZ")
                        .airportName("Tiruchirappalli International Airport")
                        .type("city").active(true)
                        .displayOrder(76).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Salem").state("Tamil Nadu").country("India")
                        .airportCode("SXV")
                        .airportName("Salem Airport")
                        .type("city").active(true)
                        .displayOrder(77).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Tuticorin").state("Tamil Nadu").country("India")
                        .airportCode("TCR")
                        .airportName("Thoothukudi Airport")
                        .type("city").active(true)
                        .displayOrder(78).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Telangana ──
                Location.builder()
                        .city("Warangal").state("Telangana").country("India")
                        .airportCode("WGC")
                        .airportName("Warangal Airport")
                        .type("city").active(true)
                        .displayOrder(79).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Tripura ──
                Location.builder()
                        .city("Agartala").state("Tripura").country("India")
                        .airportCode("IXA")
                        .airportName("Maharaja Bir Bikram Airport")
                        .type("city").active(true)
                        .displayOrder(80).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Uttar Pradesh ──
                Location.builder()
                        .city("Gorakhpur").state("Uttar Pradesh").country("India")
                        .airportCode("GOP")
                        .airportName("Gorakhpur Airport")
                        .type("city").active(true)
                        .displayOrder(81).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Prayagraj").state("Uttar Pradesh").country("India")
                        .airportCode("IXD")
                        .airportName("Prayagraj Airport")
                        .type("city").active(true)
                        .displayOrder(82).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Kanpur").state("Uttar Pradesh").country("India")
                        .airportCode("KNU")
                        .airportName("Kanpur Airport")
                        .type("city").active(true)
                        .displayOrder(83).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Agra").state("Uttar Pradesh").country("India")
                        .airportCode("AGR")
                        .airportName("Agra Airport")
                        .type("city").active(true)
                        .displayOrder(84).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Uttarakhand ──
                Location.builder()
                        .city("Pantnagar").state("Uttarakhand").country("India")
                        .airportCode("PGH")
                        .airportName("Pantnagar Airport")
                        .type("city").active(true)
                        .displayOrder(85).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── West Bengal ──
                Location.builder()
                        .city("Bagdogra").state("West Bengal").country("India")
                        .airportCode("IXB")
                        .airportName("Bagdogra Airport")
                        .type("city").active(true)
                        .displayOrder(86).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Cooch Behar").state("West Bengal").country("India")
                        .airportCode("COH")
                        .airportName("Cooch Behar Airport")
                        .type("city").active(true)
                        .displayOrder(87).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                // ── Union Territories ──
                Location.builder()
                        .city("Jammu").state("Jammu & Kashmir").country("India")
                        .airportCode("IXJ")
                        .airportName("Jammu Airport")
                        .type("city").active(true)
                        .displayOrder(88).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Chandigarh").state("Chandigarh").country("India")
                        .airportCode("IXC")
                        .airportName("Chandigarh International Airport")
                        .type("city").active(true)
                        .displayOrder(89).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Diu").state("Daman & Diu").country("India")
                        .airportCode("DIU")
                        .airportName("Diu Airport")
                        .type("city").active(true)
                        .displayOrder(90).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build(),

                Location.builder()
                        .city("Puducherry").state("Puducherry").country("India")
                        .airportCode("PNY")
                        .airportName("Puducherry Airport")
                        .type("city").active(true)
                        .displayOrder(91).showOnExplore(false).showOnHome(false)
                        .createdAt(now).updatedAt(now).updatedBy("system")
                        .build()
        );

        locationRepository.saveAll(locations);
        log.info("✅ Seeded {} locations", locations.size());
    }
}
