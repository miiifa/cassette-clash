package com.miiifa.pokemondueloffline;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

public class MainActivity extends Activity {
    private static final int REQUEST_PICK_HTML = 1001;
    private static final String LOCAL_HTML_NAME = "play.html";

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xFF111827);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(12, 10, 12, 10);
        toolbar.setBackgroundColor(0xFF111827);

        Button updateButton = new Button(this);
        updateButton.setText("HTML更新");
        updateButton.setAllCaps(false);
        updateButton.setOnClickListener(view -> openHtmlPicker());

        Button resetButton = new Button(this);
        resetButton.setText("内蔵版に戻す");
        resetButton.setAllCaps(false);
        resetButton.setOnClickListener(view -> resetToBundledHtml());

        toolbar.addView(updateButton, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        toolbar.addView(resetButton, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));

        webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient());

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        root.addView(toolbar, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ));
        root.addView(webView, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            0,
            1
        ));

        setContentView(root);
        loadCurrentHtml();
    }

    private void openHtmlPicker() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("text/html");
        startActivityForResult(intent, REQUEST_PICK_HTML);
    }

    private void loadCurrentHtml() {
        File localHtml = getLocalHtmlFile();
        if (localHtml.exists()) {
            webView.loadUrl(Uri.fromFile(localHtml).toString());
        } else {
            webView.loadUrl("file:///android_asset/play.html");
        }
    }

    private File getLocalHtmlFile() {
        return new File(getFilesDir(), LOCAL_HTML_NAME);
    }

    private void resetToBundledHtml() {
        File localHtml = getLocalHtmlFile();
        if (localHtml.exists() && !localHtml.delete()) {
            Toast.makeText(this, "更新版の削除に失敗しました", Toast.LENGTH_SHORT).show();
            return;
        }
        Toast.makeText(this, "内蔵版に戻しました", Toast.LENGTH_SHORT).show();
        webView.loadUrl("file:///android_asset/play.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_PICK_HTML || resultCode != RESULT_OK || data == null || data.getData() == null) {
            return;
        }

        Uri uri = data.getData();
        try (InputStream inputStream = getContentResolver().openInputStream(uri);
             FileOutputStream outputStream = new FileOutputStream(getLocalHtmlFile())) {
            if (inputStream == null) {
                Toast.makeText(this, "HTMLを読み込めませんでした", Toast.LENGTH_SHORT).show();
                return;
            }

            byte[] buffer = new byte[8192];
            int length;
            while ((length = inputStream.read(buffer)) > 0) {
                outputStream.write(buffer, 0, length);
            }

            Toast.makeText(this, "HTMLを更新しました", Toast.LENGTH_SHORT).show();
            loadCurrentHtml();
        } catch (Exception e) {
            Toast.makeText(this, "HTML更新に失敗しました: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
