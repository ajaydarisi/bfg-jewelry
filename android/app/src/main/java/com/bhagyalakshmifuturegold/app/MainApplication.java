package com.bhagyalakshmifuturegold.app;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import java.util.Arrays;

public class MainApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationChannel general = new NotificationChannel(
            "default", "General", NotificationManager.IMPORTANCE_HIGH);
        general.setDescription("General notifications");

        NotificationChannel orders = new NotificationChannel(
            "orders", "Orders", NotificationManager.IMPORTANCE_HIGH);
        orders.setDescription("Order status updates");

        NotificationChannel wishlist = new NotificationChannel(
            "wishlist", "Wishlist", NotificationManager.IMPORTANCE_HIGH);
        wishlist.setDescription("Price drops and back in stock alerts for wishlisted products");

        NotificationChannel newProducts = new NotificationChannel(
            "new_products", "New Products", NotificationManager.IMPORTANCE_HIGH);
        newProducts.setDescription("New product launch announcements");

        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.createNotificationChannels(
            Arrays.asList(general, orders, wishlist, newProducts));
    }
}
