'use strict';
import {View, Image, StyleSheet} from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  logo: {
    flex: 0.1,
    height: 50,
    padding: 10,
  },
  logo2: {
    flex: 0.85,
    height: 70,
    padding: 10,
  },
  viewbox: {
    flexDirection: 'row',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

const Header = ({navigation}): React$Node => (
  <View style={styles.viewbox}>
    <Image
      accessibilityRole={'image'}
      source={require('./assets/Hamburger_icon.svg.png')}
      style={styles.logo}
      onPress={() => navigation.toggleDrawer()}
    >
    </Image>
    <Image
      accessibilityRole={'image'}
      source={require('./assets/logo.png')}
      style={styles.logo2}>
    </Image>
  </View>
);

export default Header;
