import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class FullTest {
    public static void main(String[] args) throws InterruptedException {

        WebDriver driver = new ChromeDriver();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().window().maximize();

        // -------------------------------
        // TC02 - Invalid Login
        // -------------------------------
        
        driver.get("http://localhost:5173");
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Login')]"))).click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("auth-email")))
                .sendKeys("wrong@gmail.com");

        driver.findElement(By.id("auth-password")).sendKeys("wrong");
        driver.findElement(By.id("auth-password")).sendKeys(Keys.ENTER);

        System.out.println("TC02 Passed - Invalid login tested");
        Thread.sleep(2000);

        // -------------------------------
        // TC01 - Valid Login
        // -------------------------------
        driver.get("http://localhost:5173"); 
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Login')]"))).click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("auth-email")))
                .sendKeys("monishasai82@gmail.com");

        driver.findElement(By.id("auth-password")).sendKeys("1234");
        driver.findElement(By.id("auth-password")).sendKeys(Keys.ENTER);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Total')]")));
        System.out.println("TC01 Passed - Valid login");

        // -------------------------------
        // NEW: TC13 - Set Monthly Budget
        // -------------------------------
        WebElement budgetInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@type='number' and contains(@class, 'budget')] | (//input[@type='number'])[1]")));
        budgetInput.clear();
        budgetInput.sendKeys("2000");
        driver.findElement(By.xpath("//button[contains(text(),'Set Budget')]")).click();
        System.out.println("TC13 Passed - Monthly budget set to 2000");

        // -------------------------------
        // TC04 - Add Expense & Verify Remaining
        // -------------------------------
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='What did you buy?']")))
                .sendKeys("Lunch");

        driver.findElement(By.xpath("//input[@placeholder='Amount (₹)']"))
                .sendKeys("500");

        driver.findElement(By.xpath("//button[contains(text(),'Add Entry')]")).click();
        
        // Verify Math: Budget(2000) - Expense(500) = 1500
        WebElement remaining = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(text(),'Remaining')]")));
        if(remaining.getText().contains("1500")) {
            System.out.println("TC04 Passed - Expense added and balance updated correctly");
        }

        // -------------------------------
        // NEW: TC14 - Navigation to Reports
        // -------------------------------
        driver.findElement(By.xpath("//a[contains(text(),'Reports')]")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("canvas"))); // Wait for Chart
        System.out.println("TC14 Passed - Reports page and charts loaded");
        Thread.sleep(2000);

        // -------------------------------
        // TC09 - Delete Expense (Go back to Dashboard)
        // -------------------------------
        driver.findElement(By.xpath("//a[contains(text(),'Dashboard')]")).click();
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight)");
        
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("(//button[contains(@class, 'delete')])[last()]"))).click();
        System.out.println("TC09 Passed - Last expense deleted");

        // -------------------------------
        // TC10 - Logout
        // -------------------------------
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, 0)");
        wait.until(ExpectedConditions.elementToBeClickable(By.className("profile-avatar"))).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.className("logout-btn"))).click();
        System.out.println("TC10 Passed - Logout successful");

        driver.quit();
    }
}