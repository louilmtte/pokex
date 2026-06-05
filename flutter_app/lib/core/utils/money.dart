/// Formatage monétaire autonome (sans `intl`) : la valeur transite en
/// CENTIMES entiers dans tout le domaine pour éviter les flottants ; le
/// formatage n'a lieu qu'à la frontière UI.
abstract final class Money {
  static String _group(String intPart) {
    final buffer = StringBuffer();
    final n = intPart.length;
    for (var i = 0; i < n; i++) {
      if (i > 0 && (n - i) % 3 == 0) buffer.write(' ');
      buffer.write(intPart[i]);
    }
    return buffer.toString();
  }

  /// 145099 -> "1 450,99 €"
  static String euros(int cents) {
    final neg = cents < 0;
    final abs = cents.abs();
    final whole = abs ~/ 100;
    final frac = (abs % 100).toString().padLeft(2, '0');
    final body = '${_group(whole.toString())},$frac €';
    return neg ? '-$body' : body;
  }

  /// 1250000 -> "12,5 k€" · 250000000 -> "2,5 M€"
  static String compact(int cents) {
    final neg = cents < 0;
    final v = cents.abs() / 100;
    String body;
    if (v >= 1000000) {
      body = '${(v / 1000000).toStringAsFixed(1).replaceAll('.', ',')} M€';
    } else if (v >= 1000) {
      body = '${(v / 1000).toStringAsFixed(1).replaceAll('.', ',')} k€';
    } else {
      body = '${v.toStringAsFixed(0)} €';
    }
    return neg ? '-$body' : body;
  }

  /// 0.123 -> "+12,3 %"
  static String percent(double ratio) {
    final sign = ratio > 0 ? '+' : (ratio < 0 ? '-' : '');
    final value = (ratio.abs() * 100).toStringAsFixed(1).replaceAll('.', ',');
    return '$sign$value %';
  }
}
